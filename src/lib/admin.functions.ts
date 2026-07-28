import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  ENTITIES,
  coerceRecord,
  isEntityKey,
  type AdminRow,
  type EntityKey,
} from "@/lib/admin-schema";

export type AdminIdentity = {
  userId: string;
  email: string | null;
  roles: string[];
  isAdmin: boolean;
  isStaff: boolean;
};

export const getMyAccess = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminIdentity> => {
    const { data } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    const roles = (data ?? []).map((r: { role: string }) => r.role);
    return {
      userId: context.userId,
      email: (context.claims as { email?: string } | null)?.email ?? null,
      roles,
      isAdmin: roles.includes("admin"),
      isStaff: roles.length > 0,
    };
  });

export const adminList = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entity: string }) => {
    if (!isEntityKey(data.entity)) throw new Error("Unknown entity");
    return { entity: data.entity as EntityKey };
  })
  .handler(async ({ data, context }): Promise<AdminRow[]> => {
    const { requireStaff, adminClient } = await import("@/lib/admin.server");
    await requireStaff(context);
    const entity = ENTITIES[data.entity];
    const supabase = adminClient();
    const { data: rows, error } = await supabase
      .from(entity.table)
      .select("*")
      .order(entity.orderBy.column, { ascending: entity.orderBy.ascending });
    if (error) throw new Error(error.message);
    return (rows ?? []) as AdminRow[];
  });

export const adminSave = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entity: string; id?: string | null; values: AdminRow }) => {
    if (!isEntityKey(data.entity)) throw new Error("Unknown entity");
    return { entity: data.entity as EntityKey, id: data.id ?? null, values: data.values ?? {} };
  })
  .handler(async ({ data, context }): Promise<{ id: string }> => {
    const { requireStaff, adminClient, writeAudit } = await import("@/lib/admin.server");
    const identity = await requireStaff(context);
    const entity = ENTITIES[data.entity];
    const payload = coerceRecord(entity, data.values);
    const supabase = adminClient();

    if (data.id) {
      const { error } = await supabase.from(entity.table).update(payload as never).eq("id", data.id);
      if (error) throw new Error(error.message);
      await writeAudit(identity, "update", entity.table, data.id, payload);
      return { id: data.id };
    }

    const { data: row, error } = await supabase
      .from(entity.table)
      .insert(payload as never)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    await writeAudit(identity, "create", entity.table, (row as { id: string }).id, payload);
    return { id: (row as { id: string }).id };
  });

export const adminBulkInsert = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entity: string; rows: AdminRow[] }) => {
    if (!isEntityKey(data.entity)) throw new Error("Unknown entity");
    if (!Array.isArray(data.rows) || data.rows.length === 0) throw new Error("No rows supplied");
    if (data.rows.length > 500) throw new Error("Maximum 500 rows per import");
    return { entity: data.entity as EntityKey, rows: data.rows };
  })
  .handler(async ({ data, context }): Promise<{ inserted: number }> => {
    const { requireStaff, adminClient, writeAudit } = await import("@/lib/admin.server");
    const identity = await requireStaff(context);
    const entity = ENTITIES[data.entity];
    const payload = data.rows.map((row) => coerceRecord(entity, row));
    const supabase = adminClient();
    const { error, count } = await supabase
      .from(entity.table)
      .insert(payload as never, { count: "exact" });
    if (error) throw new Error(error.message);
    await writeAudit(identity, "bulk_import", entity.table, null, { rows: payload.length });
    return { inserted: count ?? payload.length };
  });

export const adminSetPublished = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entity: string; ids: string[]; published: boolean }) => {
    if (!isEntityKey(data.entity)) throw new Error("Unknown entity");
    if (!Array.isArray(data.ids) || data.ids.length === 0) throw new Error("No records selected");
    return { entity: data.entity as EntityKey, ids: data.ids, published: !!data.published };
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { requireStaff, adminClient, writeAudit } = await import("@/lib/admin.server");
    const identity = await requireStaff(context);
    const entity = ENTITIES[data.entity];
    const supabase = adminClient();
    const { error } = await supabase
      .from(entity.table)
      .update({ published: data.published })
      .in("id", data.ids);
    if (error) throw new Error(error.message);
    await writeAudit(identity, data.published ? "publish" : "unpublish", entity.table, null, {
      ids: data.ids,
    });
    return { ok: true };
  });

export const adminDelete = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { entity: string; ids: string[] }) => {
    if (!isEntityKey(data.entity)) throw new Error("Unknown entity");
    if (!Array.isArray(data.ids) || data.ids.length === 0) throw new Error("No records selected");
    return { entity: data.entity as EntityKey, ids: data.ids };
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { requireAdmin, adminClient, writeAudit } = await import("@/lib/admin.server");
    const identity = await requireAdmin(context);
    const entity = ENTITIES[data.entity];
    const supabase = adminClient();
    const { error } = await supabase.from(entity.table).delete().in("id", data.ids);
    if (error) throw new Error(error.message);
    await writeAudit(identity, "delete", entity.table, null, { ids: data.ids });
    return { ok: true };
  });

/* ---------------------------------- Inboxes --------------------------------- */

export const adminListInbox = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { kind: string }) => {
    if (data.kind !== "submissions" && data.kind !== "sponsor_enquiries" && data.kind !== "subscribers") {
      throw new Error("Unknown inbox");
    }
    return { kind: data.kind };
  })
  .handler(async ({ data, context }): Promise<AdminRow[]> => {
    const { requireStaff, adminClient } = await import("@/lib/admin.server");
    await requireStaff(context);
    const supabase = adminClient();
    const columns =
      data.kind === "subscribers"
        ? "id, email, source, status, unsubscribed_at, created_at"
        : "*";
    const { data: rows, error } = await supabase
      .from(data.kind)
      .select(columns)
      .order("created_at", { ascending: false })
      .limit(1000);
    if (error) throw new Error(error.message);
    return (rows ?? []) as AdminRow[];
  });

export const adminUpdateInboxItem = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { kind: string; id: string; status?: string; admin_notes?: string }) => {
    if (data.kind !== "submissions" && data.kind !== "sponsor_enquiries") {
      throw new Error("Unknown inbox");
    }
    if (!data.id) throw new Error("Missing id");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { requireStaff, adminClient, writeAudit } = await import("@/lib/admin.server");
    const identity = await requireStaff(context);
    const patch: AdminRow = {};
    if (data.status !== undefined) patch.status = data.status;
    if (data.admin_notes !== undefined) patch.admin_notes = data.admin_notes.slice(0, 2000);
    const supabase = adminClient();
    const { error } = await supabase.from(data.kind).update(patch as never).eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(identity, "update", data.kind, data.id, patch);
    return { ok: true };
  });

/* --------------------------------- Settings --------------------------------- */

export const adminGetSettings = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminRow> => {
    const { requireStaff, adminClient } = await import("@/lib/admin.server");
    await requireStaff(context);
    const supabase = adminClient();
    const { data, error } = await supabase.from("site_settings").select("*").eq("id", true).single();
    if (error) throw new Error(error.message);
    return data as AdminRow;
  });

export const adminSaveSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { values: AdminRow }) => ({ values: data.values ?? {} }))
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { requireAdmin, adminClient, writeAudit, SETTINGS_COLUMNS } = await import(
      "@/lib/admin.server"
    );
    const identity = await requireAdmin(context);
    const patch: AdminRow = {};
    for (const key of SETTINGS_COLUMNS) {
      if (key in data.values) patch[key] = data.values[key];
    }
    const supabase = adminClient();
    const { error } = await supabase.from("site_settings").update(patch as never).eq("id", true);
    if (error) throw new Error(error.message);
    await writeAudit(identity, "update", "site_settings", "singleton", patch);
    return { ok: true };
  });

/* ----------------------------------- Team ----------------------------------- */

export type TeamMember = { id: string; email: string | null; display_name: string | null; roles: string[] };

export const adminListTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<TeamMember[]> => {
    const { requireAdmin, adminClient } = await import("@/lib/admin.server");
    await requireAdmin(context);
    const supabase = adminClient();
    const [{ data: profiles }, { data: roles }] = await Promise.all([
      supabase.from("profiles").select("id, email, display_name"),
      supabase.from("user_roles").select("user_id, role"),
    ]);
    const roleMap = new Map<string, string[]>();
    for (const r of (roles ?? []) as { user_id: string; role: string }[]) {
      roleMap.set(r.user_id, [...(roleMap.get(r.user_id) ?? []), r.role]);
    }
    return ((profiles ?? []) as { id: string; email: string | null; display_name: string | null }[]).map(
      (p) => ({ ...p, roles: roleMap.get(p.id) ?? [] }),
    );
  });

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string; role: string; grant: boolean }) => {
    if (data.role !== "admin" && data.role !== "editor") throw new Error("Unknown role");
    if (!data.userId) throw new Error("Missing user");
    return data;
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { requireAdmin, adminClient, writeAudit } = await import("@/lib/admin.server");
    const identity = await requireAdmin(context);
    if (data.userId === identity.userId && data.role === "admin" && !data.grant) {
      throw new Error("You cannot remove your own admin role");
    }
    const supabase = adminClient();
    if (data.grant) {
      const { error } = await supabase
        .from("user_roles")
        .upsert({ user_id: data.userId, role: data.role }, { onConflict: "user_id,role" });
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", data.userId)
        .eq("role", data.role);
      if (error) throw new Error(error.message);
    }
    await writeAudit(identity, data.grant ? "grant_role" : "revoke_role", "user_roles", data.userId, {
      role: data.role,
    });
    return { ok: true };
  });

/* -------------------------------- Dashboard --------------------------------- */

export type AdminStats = {
  subscribers: number;
  jobs: { total: number; published: number };
  deals: { total: number; published: number };
  events: { total: number; published: number };
  openSubmissions: number;
  openSponsors: number;
  recentActivity: {
    id: string;
    action: string;
    entity: string;
    actor_email: string | null;
    created_at: string;
  }[];
};

export const adminStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<AdminStats> => {
    const { requireStaff, adminClient, countPair } = await import("@/lib/admin.server");
    await requireStaff(context);
    const supabase = adminClient();

    const [subs, jobs, deals, events, submissions, sponsors, activity] = await Promise.all([
      supabase.from("subscribers").select("id", { count: "exact", head: true }),
      countPair(supabase, "jobs"),
      countPair(supabase, "deals"),
      countPair(supabase, "events"),
      supabase.from("submissions").select("id", { count: "exact", head: true }).eq("status", "new"),
      supabase
        .from("sponsor_enquiries")
        .select("id", { count: "exact", head: true })
        .eq("status", "new"),
      supabase
        .from("audit_log")
        .select("id, action, entity, actor_email, created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    return {
      subscribers: subs.count ?? 0,
      jobs,
      deals,
      events,
      openSubmissions: submissions.count ?? 0,
      openSponsors: sponsors.count ?? 0,
      recentActivity: (activity.data ?? []) as AdminStats["recentActivity"],
    };
  });

/** Admin-only: create a staff account with a one-time password (public signup is disabled). */
export const adminCreateStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string; role: string }) => {
    const email = String(data.email ?? "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 255) {
      throw new Error("Enter a valid email address");
    }
    if (data.role !== "admin" && data.role !== "editor") throw new Error("Unknown role");
    return { email, role: data.role as "admin" | "editor" };
  })
  .handler(async ({ data, context }): Promise<{ email: string; password: string }> => {
    const { requireAdmin, adminClient, writeAudit } = await import("@/lib/admin.server");
    const identity = await requireAdmin(context);
    const supabase = adminClient();

    const bytes = new Uint8Array(18);
    crypto.getRandomValues(bytes);
    const password = `Aw1!${btoa(String.fromCharCode(...bytes)).replace(/[^a-zA-Z0-9]/g, "x")}`;

    const { data: created, error } = await supabase.auth.admin.createUser({
      email: data.email,
      password,
      email_confirm: true,
    });
    if (error || !created.user) throw new Error(error?.message ?? "Could not create the account");

    const { error: roleError } = await supabase
      .from("user_roles")
      .upsert({ user_id: created.user.id, role: data.role }, { onConflict: "user_id,role" });
    if (roleError) throw new Error(roleError.message);

    await writeAudit(identity, "create_staff", "user_roles", created.user.id, {
      email: data.email,
      role: data.role,
    });
    return { email: data.email, password };
  });

/* --------------------------------- Uploads ---------------------------------- */

const ALLOWED_UPLOAD_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "image/x-icon", "image/vnd.microsoft.icon"];

/** Staff-only: upload a brand/cover asset and return the URL the public site should use. */
export const adminUploadAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { filename: string; contentType: string; dataBase64: string }) => {
    const filename = String(data.filename ?? "").replace(/[^a-zA-Z0-9._-]/g, "-").slice(-80);
    if (!filename) throw new Error("Missing filename");
    if (!ALLOWED_UPLOAD_TYPES.includes(data.contentType)) {
      throw new Error("Only PNG, JPEG, WebP, SVG or ICO files are allowed");
    }
    if (!data.dataBase64 || data.dataBase64.length > 8_000_000) {
      throw new Error("File is too large (max ~5MB)");
    }
    return { filename, contentType: data.contentType, dataBase64: data.dataBase64 };
  })
  .handler(async ({ data, context }): Promise<{ url: string }> => {
    const { requireStaff, adminClient, writeAudit } = await import("@/lib/admin.server");
    const identity = await requireStaff(context);
    const bytes = Uint8Array.from(atob(data.dataBase64), (c) => c.charCodeAt(0));
    const key = `${Date.now()}-${data.filename}`;
    const supabase = adminClient();
    const { error } = await supabase.storage
      .from("brand")
      .upload(key, bytes, { contentType: data.contentType, upsert: false });
    if (error) throw new Error(error.message);
    await writeAudit(identity, "upload", "brand", key, { contentType: data.contentType });
    return { url: `/api/public/brand/${key}` };
  });

/* ------------------------------- Subscribers -------------------------------- */

export const adminUpdateSubscriber = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { id: string; status: string }) => {
    if (!data.id) throw new Error("Missing subscriber");
    if (!["active", "unsubscribed", "bounced"].includes(data.status)) {
      throw new Error("Unknown status");
    }
    return { id: data.id, status: data.status };
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { requireStaff, adminClient, writeAudit } = await import("@/lib/admin.server");
    const identity = await requireStaff(context);
    const supabase = adminClient();
    const { error } = await supabase
      .from("subscribers")
      .update({
        status: data.status,
        unsubscribed_at: data.status === "unsubscribed" ? new Date().toISOString() : null,
      } as never)
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await writeAudit(identity, "update", "subscribers", data.id, { status: data.status });
    return { ok: true };
  });

export const adminDeleteSubscribers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { ids: string[] }) => {
    if (!Array.isArray(data.ids) || data.ids.length === 0) throw new Error("No subscribers selected");
    return { ids: data.ids };
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { requireAdmin, adminClient, writeAudit } = await import("@/lib/admin.server");
    const identity = await requireAdmin(context);
    const supabase = adminClient();
    const { error } = await supabase.from("subscribers").delete().in("id", data.ids);
    if (error) throw new Error(error.message);
    await writeAudit(identity, "delete", "subscribers", null, { ids: data.ids });
    return { ok: true };
  });

/* ----------------------------- Staff accounts ------------------------------- */

/** Admin-only: email a password reset link to a staff member. */
export const adminSendPasswordReset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { email: string; redirectTo: string }) => {
    const email = String(data.email ?? "").trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Invalid email address");
    return { email, redirectTo: String(data.redirectTo ?? "").slice(0, 300) };
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { requireAdmin, adminClient, writeAudit } = await import("@/lib/admin.server");
    const identity = await requireAdmin(context);
    const supabase = adminClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: data.redirectTo || undefined,
    });
    if (error) throw new Error(error.message);
    await writeAudit(identity, "password_reset", "auth.users", null, { email: data.email });
    return { ok: true };
  });

/** Admin-only: revoke all access — removes roles, signs the user out and disables the login. */
export const adminDeactivateStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { userId: string }) => {
    if (!data.userId) throw new Error("Missing user");
    return { userId: data.userId };
  })
  .handler(async ({ data, context }): Promise<{ ok: true }> => {
    const { requireAdmin, adminClient, writeAudit } = await import("@/lib/admin.server");
    const identity = await requireAdmin(context);
    if (data.userId === identity.userId) throw new Error("You cannot deactivate your own account");
    const supabase = adminClient();
    await supabase.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabase.auth.admin.updateUserById(data.userId, {
      ban_duration: "876000h",
    });
    if (error) throw new Error(error.message);
    await writeAudit(identity, "deactivate_staff", "auth.users", data.userId, {});
    return { ok: true };
  });
