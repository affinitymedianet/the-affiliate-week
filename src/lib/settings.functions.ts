import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PublicSettings = {
  siteName: string;
  tagline: string;
  logoUrl: string | null;
  logoDarkUrl: string | null;
  faviconUrl: string | null;
  contactEmail: string;
  submitUrl: string;
  privacyContent: string;
  privacyUpdatedAt: string | null;
  termsContent: string;
  termsUpdatedAt: string | null;
  seoDescription: string;
  seoShareImageUrl: string | null;
};

export const getSiteSettings = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicSettings | null> => {
    const url = process.env.SUPABASE_URL!;
    const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const supabase = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    const { data, error } = await supabase
      .from("site_settings")
      .select(
        "site_name, tagline, logo_url, logo_dark_url, favicon_url, contact_email, submit_url, privacy_content, privacy_updated_at, terms_content, terms_updated_at, seo_description, seo_share_image_url",
      )
      .eq("id", true)
      .maybeSingle();

    if (error || !data) return null;
    const row = data as Record<string, string | null>;
    return {
      siteName: row.site_name ?? "The Affiliate Week",
      tagline: row.tagline ?? "",
      logoUrl: row.logo_url || null,
      logoDarkUrl: row.logo_dark_url || null,
      faviconUrl: row.favicon_url || null,
      contactEmail: row.contact_email ?? "",
      submitUrl: row.submit_url ?? "",
      privacyContent: row.privacy_content ?? "",
      privacyUpdatedAt: row.privacy_updated_at || null,
      termsContent: row.terms_content ?? "",
      termsUpdatedAt: row.terms_updated_at || null,
      seoDescription: row.seo_description ?? "",
      seoShareImageUrl: row.seo_share_image_url || null,
    };
  },
);
