/**
 * Admin data layer (Firestore).
 *
 * The admin area is client-rendered and every call carries the signed-in
 * staff member's Firebase ID token; Firestore security rules decide what that
 * token is allowed to read or write. Function names and call shapes are kept
 * identical to the previous server-function API so the admin routes are
 * unchanged.
 */
import { COLLECTIONS, SETTINGS_DOC, firebaseConfig } from "@/integrations/firebase/config";
import {
  authToken,
  firebaseAuth,
  sendReset,
  uploadToStorage,
} from "@/integrations/firebase/auth";
import {
  fsCreate,
  fsDelete,
  fsGet,
  fsGetPath,
  fsList,
  fsSetPath,
  fsUpdate,
  nowIso,
  type Row,
} from "@/integrations/firebase/firestore";
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

type InboxKind = "submissions" | "sponsor_enquiries" | "subscribers";

function entityOf(entity: string) {
  if (!isEntityKey(entity)) throw new Error("Unknown entity");
  return ENTITIES[entity as EntityKey];
}

function assertInbox(kind: string): InboxKind {
  if (kind !== "submissions" && kind !== "sponsor_enquiries" && kind !== "subscribers") {
    throw new Error("Unknown inbox");
  }
  return kind;
}

/* --------------------------------- Identity -------------------------------- */

export async function getMyAccess(): Promise<AdminIdentity> {
  const token = await authToken();
  const user = firebaseAuth().currentUser;
  const uid = user?.uid ?? "";
  const roleDoc = await fsGet(COLLECTIONS.roles, uid, token);
  const active = roleDoc?.active !== false;
  const role = typeof roleDoc?.role === "string" ? roleDoc.role : null;
  const roles = roleDoc && active && role ? [role] : [];
  return {
    userId: uid,
    email: user?.email ?? null,
    roles,
    isAdmin: roles.includes("admin"),
    isStaff: roles.length > 0,
  };
}

async function requireIdentity(needAdmin = false): Promise<AdminIdentity> {
  const identity = await getMyAccess();
  if (!identity.isStaff) throw new Error("Your account does not have staff access.");
  if (needAdmin && !identity.isAdmin) throw new Error("Admins only.");
  return identity;
}

async function writeAudit(
  identity: AdminIdentity,
  action: string,
  entity: string,
  entityId: string | null,
  detail: Row,
) {
  try {
    const token = await authToken();
    await fsCreate(
      COLLECTIONS.audit_log,
      {
        actor_id: identity.userId,
        actor_email: identity.email,
        action,
        entity,
        entity_id: entityId,
        detail: JSON.stringify(detail).slice(0, 4000),
        created_at: nowIso(),
      },
      token,
    );
  } catch {
    /* auditing must never block the action */
  }
}

/* --------------------------------- Records --------------------------------- */

function sortRows(rows: Row[], column: string, ascending: boolean): Row[] {
  return [...rows].sort((a, b) => {
    const av = a[column];
    const bv = b[column];
    if (typeof av === "number" && typeof bv === "number") {
      return ascending ? av - bv : bv - av;
    }
    if (typeof av === "boolean" || typeof bv === "boolean") {
      const an = av === true ? 1 : 0;
      const bn = bv === true ? 1 : 0;
      return ascending ? an - bn : bn - an;
    }
    const as = String(av ?? "");
    const bs = String(bv ?? "");
    return ascending ? as.localeCompare(bs) : bs.localeCompare(as);
  });
}

export async function adminList({ data }: { data: { entity: string } }): Promise<AdminRow[]> {
  await requireIdentity();
  const entity = entityOf(data.entity);
  const rows = await fsList(entity.table, await authToken());
  return sortRows(rows, entity.orderBy.column, entity.orderBy.ascending) as AdminRow[];
}

export async function adminGetRecord({
  data,
}: {
  data: { entity: string; id: string };
}): Promise<AdminRow | null> {
  await requireIdentity();
  const entity = entityOf(data.entity);
  if (!data.id) throw new Error("Missing id");
  return (await fsGet(entity.table, data.id, await authToken())) as AdminRow | null;
}

export async function adminSave({
  data,
}: {
  data: { entity: string; id?: string | null; values: AdminRow };
}): Promise<{ id: string }> {
  const identity = await requireIdentity();
  const entity = entityOf(data.entity);
  const payload = coerceRecord(entity, data.values ?? {}) as Row;
  const token = await authToken();

  if (data.id) {
    await fsUpdate(entity.table, data.id, { ...payload, updated_at: nowIso() }, token);
    await writeAudit(identity, "update", entity.table, data.id, payload);
    return { id: data.id };
  }

  const id = await fsCreate(
    entity.table,
    { ...payload, created_at: nowIso(), updated_at: nowIso() },
    token,
  );
  await writeAudit(identity, "create", entity.table, id, payload);
  return { id };
}

export async function adminBulkInsert({
  data,
}: {
  data: { entity: string; rows: AdminRow[] };
}): Promise<{ inserted: number }> {
  const identity = await requireIdentity();
  const entity = entityOf(data.entity);
  if (!Array.isArray(data.rows) || data.rows.length === 0) throw new Error("No rows supplied");
  if (data.rows.length > 500) throw new Error("Maximum 500 rows per import");
  const token = await authToken();

  let inserted = 0;
  for (const row of data.rows) {
    const payload = coerceRecord(entity, row) as Row;
    await fsCreate(entity.table, { ...payload, created_at: nowIso(), updated_at: nowIso() }, token);
    inserted += 1;
  }
  await writeAudit(identity, "bulk_import", entity.table, null, { rows: inserted });
  return { inserted };
}

export async function adminSetPublished({
  data,
}: {
  data: { entity: string; ids: string[]; published: boolean };
}): Promise<{ ok: true }> {
  const identity = await requireIdentity();
  const entity = entityOf(data.entity);
  if (!Array.isArray(data.ids) || data.ids.length === 0) throw new Error("No records selected");
  const token = await authToken();
  for (const id of data.ids) {
    await fsUpdate(entity.table, id, { published: !!data.published, updated_at: nowIso() }, token);
  }
  await writeAudit(identity, data.published ? "publish" : "unpublish", entity.table, null, {
    ids: data.ids,
  });
  return { ok: true };
}

export async function adminDelete({
  data,
}: {
  data: { entity: string; ids: string[] };
}): Promise<{ ok: true }> {
  const identity = await requireIdentity(true);
  const entity = entityOf(data.entity);
  if (!Array.isArray(data.ids) || data.ids.length === 0) throw new Error("No records selected");
  const token = await authToken();
  for (const id of data.ids) await fsDelete(entity.table, id, token);
  await writeAudit(identity, "delete", entity.table, null, { ids: data.ids });
  return { ok: true };
}

/* ---------------------------------- Inboxes -------------------------------- */

export async function adminListInbox({ data }: { data: { kind: string } }): Promise<AdminRow[]> {
  await requireIdentity();
  const kind = assertInbox(data.kind);
  const rows = await fsList(COLLECTIONS[kind], await authToken());
  return sortRows(rows, "created_at", false).slice(0, 1000) as AdminRow[];
}

export async function adminGetInboxItem({
  data,
}: {
  data: { kind: string; id: string };
}): Promise<AdminRow | null> {
  await requireIdentity();
  const kind = assertInbox(data.kind);
  if (!data.id) throw new Error("Missing id");
  return (await fsGet(COLLECTIONS[kind], data.id, await authToken())) as AdminRow | null;
}

export async function adminUpdateInboxItem({
  data,
}: {
  data: { kind: string; id: string; status?: string; admin_notes?: string };
}): Promise<{ ok: true }> {
  const identity = await requireIdentity();
  const kind = assertInbox(data.kind);
  if (kind === "subscribers") throw new Error("Unknown inbox");
  if (!data.id) throw new Error("Missing id");
  const patch: Row = {};
  if (data.status !== undefined) patch.status = data.status;
  if (data.admin_notes !== undefined) patch.admin_notes = data.admin_notes.slice(0, 2000);
  await fsUpdate(COLLECTIONS[kind], data.id, patch, await authToken());
  await writeAudit(identity, "update", kind, data.id, patch);
  return { ok: true };
}

export async function adminDeleteInboxItem({
  data,
}: {
  data: { kind: string; id: string };
}): Promise<{ ok: true }> {
  const identity = await requireIdentity(true);
  const kind = assertInbox(data.kind);
  if (!data.id) throw new Error("Missing id");
  await fsDelete(COLLECTIONS[kind], data.id, await authToken());
  await writeAudit(identity, "delete", kind, data.id, {});
  return { ok: true };
}

/* --------------------------------- Settings -------------------------------- */

export const SETTINGS_FIELDS = [
  "site_name",
  "tagline",
  "logo_url",
  "logo_dark_url",
  "favicon_url",
  "contact_email",
  "social_links",
  "privacy_content",
  "privacy_updated_at",
  "terms_content",
  "terms_updated_at",
  "newsletter_provider",
  "newsletter_list_id",
  "double_opt_in",
  "welcome_email",
  "submit_url",
  "seo_title_template",
  "seo_description",
  "seo_share_image_url",
  "analytics_id",
  "search_console_tag",
] as const;

export async function adminGetSettings(): Promise<AdminRow> {
  await requireIdentity();
  const row = (await fsGetPath(SETTINGS_DOC, await authToken())) ?? {};
  return row as AdminRow;
}

export async function adminSaveSettings({
  data,
}: {
  data: { values: AdminRow };
}): Promise<{ ok: true }> {
  const identity = await requireIdentity(true);
  const patch: Row = {};
  for (const key of SETTINGS_FIELDS) {
    if (key in (data.values ?? {})) patch[key] = data.values[key];
  }
  patch.updated_at = nowIso();
  await fsSetPath(SETTINGS_DOC, patch, await authToken());
  await writeAudit(identity, "update", "settings", "site", patch);
  return { ok: true };
}

/* ----------------------------------- Team ---------------------------------- */

export type TeamMember = {
  id: string;
  email: string | null;
  display_name: string | null;
  roles: string[];
};

export async function adminListTeam(): Promise<TeamMember[]> {
  await requireIdentity(true);
  const rows = await fsList(COLLECTIONS.roles, await authToken());
  return rows.map((row) => ({
    id: String(row.id),
    email: typeof row.email === "string" ? row.email : null,
    display_name: typeof row.display_name === "string" ? row.display_name : null,
    roles: row.active === false || typeof row.role !== "string" ? [] : [row.role],
  }));
}

export async function adminSetRole({
  data,
}: {
  data: { userId: string; role: string; grant: boolean };
}): Promise<{ ok: true }> {
  const identity = await requireIdentity(true);
  if (data.role !== "admin" && data.role !== "editor") throw new Error("Unknown role");
  if (!data.userId) throw new Error("Missing user");
  if (data.userId === identity.userId && data.role === "admin" && !data.grant) {
    throw new Error("You cannot remove your own admin role");
  }
  const token = await authToken();
  await fsUpdate(
    COLLECTIONS.roles,
    data.userId,
    data.grant ? { role: data.role, active: true } : { role: "editor", active: false },
    token,
  );
  await writeAudit(identity, data.grant ? "grant_role" : "revoke_role", "roles", data.userId, {
    role: data.role,
  });
  return { ok: true };
}

/**
 * Admin-only: create a staff login. A separate Firebase app instance is used so
 * creating the account never replaces the current admin's own session.
 */
export async function adminCreateStaff({
  data,
}: {
  data: { email: string; role: string };
}): Promise<{ email: string; password: string }> {
  const identity = await requireIdentity(true);
  const email = String(data.email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 255) {
    throw new Error("Enter a valid email address");
  }
  if (data.role !== "admin" && data.role !== "editor") throw new Error("Unknown role");

  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  const password = `Aw1!${btoa(String.fromCharCode(...bytes)).replace(/[^a-zA-Z0-9]/g, "x")}`;

  const [{ initializeApp, deleteApp }, { getAuth, createUserWithEmailAndPassword, signOut }] =
    await Promise.all([import("firebase/app"), import("firebase/auth")]);

  const secondary = initializeApp(firebaseConfig, `staff-${Date.now()}`);
  let uid = "";
  try {
    const secondaryAuth = getAuth(secondary);
    const created = await createUserWithEmailAndPassword(secondaryAuth, email, password);
    uid = created.user.uid;
    await signOut(secondaryAuth);
  } finally {
    await deleteApp(secondary);
  }

  await fsCreate(
    COLLECTIONS.roles,
    { email, display_name: email.split("@")[0], role: data.role, active: true, created_at: nowIso() },
    await authToken(),
    uid,
  );
  await writeAudit(identity, "create_staff", "roles", uid, { email, role: data.role });
  return { email, password };
}

/** Admin-only: email a password reset link to a staff member. */
export async function adminSendPasswordReset({
  data,
}: {
  data: { email: string; redirectTo?: string };
}): Promise<{ ok: true }> {
  const identity = await requireIdentity(true);
  const email = String(data.email ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Invalid email address");
  await sendReset(email);
  await writeAudit(identity, "password_reset", "roles", null, { email });
  return { ok: true };
}

/** Admin-only: revoke all access by deactivating the staff role record. */
export async function adminDeactivateStaff({
  data,
}: {
  data: { userId: string };
}): Promise<{ ok: true }> {
  const identity = await requireIdentity(true);
  if (!data.userId) throw new Error("Missing user");
  if (data.userId === identity.userId) throw new Error("You cannot deactivate your own account");
  await fsUpdate(
    COLLECTIONS.roles,
    data.userId,
    { active: false, deactivated_at: nowIso() },
    await authToken(),
  );
  await writeAudit(identity, "deactivate_staff", "roles", data.userId, {});
  return { ok: true };
}

/* -------------------------------- Dashboard -------------------------------- */

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

export async function adminStats(): Promise<AdminStats> {
  await requireIdentity();
  const token = await authToken();
  const [subscribers, jobs, deals, events, submissions, sponsors, audit] = await Promise.all([
    fsList(COLLECTIONS.subscribers, token),
    fsList(COLLECTIONS.jobs, token),
    fsList(COLLECTIONS.deals, token),
    fsList(COLLECTIONS.events, token),
    fsList(COLLECTIONS.submissions, token),
    fsList(COLLECTIONS.sponsor_enquiries, token),
    fsList(COLLECTIONS.audit_log, token),
  ]);

  const pair = (rows: Row[]) => ({
    total: rows.length,
    published: rows.filter((row) => row.published === true).length,
  });

  return {
    subscribers: subscribers.length,
    jobs: pair(jobs),
    deals: pair(deals),
    events: pair(events),
    openSubmissions: submissions.filter((row) => row.status === "new").length,
    openSponsors: sponsors.filter((row) => row.status === "new").length,
    recentActivity: sortRows(audit, "created_at", false)
      .slice(0, 8)
      .map((row) => ({
        id: String(row.id),
        action: String(row.action ?? ""),
        entity: String(row.entity ?? ""),
        actor_email: typeof row.actor_email === "string" ? row.actor_email : null,
        created_at: String(row.created_at ?? ""),
      })),
  };
}

/* --------------------------------- Uploads --------------------------------- */

const ALLOWED_UPLOAD_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/svg+xml",
  "image/x-icon",
  "image/vnd.microsoft.icon",
];

/** Staff-only: upload a brand/cover asset and return its public URL. */
export async function adminUploadAsset({
  data,
}: {
  data: { filename: string; contentType: string; dataBase64: string };
}): Promise<{ url: string }> {
  const identity = await requireIdentity();
  const filename = String(data.filename ?? "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .slice(-80);
  if (!filename) throw new Error("Missing filename");
  if (!ALLOWED_UPLOAD_TYPES.includes(data.contentType)) {
    throw new Error("Only PNG, JPEG, WebP, SVG or ICO files are allowed");
  }
  if (!data.dataBase64 || data.dataBase64.length > 8_000_000) {
    throw new Error("File is too large (max ~5MB)");
  }

  const bytes = Uint8Array.from(atob(data.dataBase64), (c) => c.charCodeAt(0));
  const key = `brand/${Date.now()}-${filename}`;
  const url = await uploadToStorage(key, new Blob([bytes], { type: data.contentType }), data.contentType);
  await writeAudit(identity, "upload", "brand", key, { contentType: data.contentType });
  return { url };
}

/* ------------------------------- Subscribers ------------------------------- */

export async function adminUpdateSubscriber({
  data,
}: {
  data: { id: string; status: string };
}): Promise<{ ok: true }> {
  const identity = await requireIdentity();
  if (!data.id) throw new Error("Missing subscriber");
  if (!["active", "unsubscribed", "bounced"].includes(data.status)) {
    throw new Error("Unknown status");
  }
  await fsUpdate(
    COLLECTIONS.subscribers,
    data.id,
    {
      status: data.status,
      unsubscribed_at: data.status === "unsubscribed" ? nowIso() : null,
    },
    await authToken(),
  );
  await writeAudit(identity, "update", "subscribers", data.id, { status: data.status });
  return { ok: true };
}

export async function adminDeleteSubscribers({
  data,
}: {
  data: { ids: string[] };
}): Promise<{ ok: true }> {
  const identity = await requireIdentity(true);
  if (!Array.isArray(data.ids) || data.ids.length === 0) {
    throw new Error("No subscribers selected");
  }
  const token = await authToken();
  for (const id of data.ids) await fsDelete(COLLECTIONS.subscribers, id, token);
  await writeAudit(identity, "delete", "subscribers", null, { ids: data.ids });
  return { ok: true };
}

/* ------------------------- Integrations & API keys ------------------------- */

/**
 * API keys live in `private_settings/integrations`, a document only admins can
 * read or write (see firestore.rules). Never move these into `settings/site`:
 * that document is world-readable because the public site renders from it.
 */
export const INTEGRATIONS_DOC = "private_settings/integrations";

export const INTEGRATION_FIELDS = [
  "esp_provider",
  "esp_api_key",
  "esp_publication_id",
  "esp_audience_id",
  "esp_from_name",
  "esp_from_email",
  "esp_reply_to",
  "transactional_provider",
  "transactional_api_key",
  "notify_email",
  "slack_webhook_url",
  "recaptcha_site_key",
  "recaptcha_secret_key",
  "webhook_shared_secret",
  "sitemap_ping_url",
] as const;

export async function adminGetIntegrations(): Promise<AdminRow> {
  await requireIdentity(true);
  const row = (await fsGetPath(INTEGRATIONS_DOC, await authToken())) ?? {};
  return row as AdminRow;
}

export async function adminSaveIntegrations({
  data,
}: {
  data: { values: AdminRow };
}): Promise<{ ok: true }> {
  const identity = await requireIdentity(true);
  const patch: Row = {};
  for (const key of INTEGRATION_FIELDS) {
    if (key in (data.values ?? {})) patch[key] = data.values[key];
  }
  patch.updated_at = nowIso();
  await fsSetPath(INTEGRATIONS_DOC, patch, await authToken());
  // Audit the fact of the change only — never the values.
  await writeAudit(identity, "update", "integrations", "integrations", {
    keys: Object.keys(patch).join(","),
  });
  return { ok: true };
}
