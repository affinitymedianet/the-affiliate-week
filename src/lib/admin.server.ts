import type { SupabaseClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type AdminIdentityInternal = {
  userId: string;
  email: string | null;
  roles: string[];
  isAdmin: boolean;
};

type AuthedContext = {
  supabase: SupabaseClient<any, any, any>;
  userId: string;
  claims: unknown;
};

export const SETTINGS_COLUMNS = [
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

export function adminClient() {
  return supabaseAdmin as unknown as SupabaseClient<any, any, any>;
}

async function loadIdentity(context: AuthedContext): Promise<AdminIdentityInternal> {
  const { data } = await context.supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", context.userId);
  const roles = ((data ?? []) as { role: string }[]).map((r) => r.role);
  return {
    userId: context.userId,
    email: (context.claims as { email?: string } | null)?.email ?? null,
    roles,
    isAdmin: roles.includes("admin"),
  };
}

export async function requireStaff(context: AuthedContext): Promise<AdminIdentityInternal> {
  const identity = await loadIdentity(context);
  if (identity.roles.length === 0) throw new Error("Forbidden: staff access required");
  return identity;
}

export async function requireAdmin(context: AuthedContext): Promise<AdminIdentityInternal> {
  const identity = await loadIdentity(context);
  if (!identity.isAdmin) throw new Error("Forbidden: admin access required");
  return identity;
}

export async function writeAudit(
  identity: AdminIdentityInternal,
  action: string,
  entity: string,
  entityId: string | null,
  detail: unknown,
) {
  try {
    await adminClient().from("audit_log").insert({
      actor_id: identity.userId,
      actor_email: identity.email,
      action,
      entity,
      entity_id: entityId,
      detail: detail as Record<string, unknown>,
    });
  } catch (error) {
    console.error("[audit]", error);
  }
}

export async function countPair(supabase: SupabaseClient<any, any, any>, table: string) {
  const [all, published] = await Promise.all([
    supabase.from(table).select("id", { count: "exact", head: true }),
    supabase.from(table).select("id", { count: "exact", head: true }).eq("published", true),
  ]);
  return { total: all.count ?? 0, published: published.count ?? 0 };
}
