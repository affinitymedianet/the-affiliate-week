import { SETTINGS_DOC } from "@/integrations/firebase/config";
import { fsGetPath } from "@/integrations/firebase/firestore";

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

const str = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

export async function getSiteSettings(): Promise<PublicSettings | null> {
  const row = await fsGetPath(SETTINGS_DOC);
  if (!row) return null;
  return {
    siteName: str(row.site_name, "The Affiliate Week"),
    tagline: str(row.tagline),
    logoUrl: str(row.logo_url) || null,
    logoDarkUrl: str(row.logo_dark_url) || null,
    faviconUrl: str(row.favicon_url) || null,
    contactEmail: str(row.contact_email),
    submitUrl: str(row.submit_url),
    privacyContent: str(row.privacy_content),
    privacyUpdatedAt: str(row.privacy_updated_at) || null,
    termsContent: str(row.terms_content),
    termsUpdatedAt: str(row.terms_updated_at) || null,
    seoDescription: str(row.seo_description),
    seoShareImageUrl: str(row.seo_share_image_url) || null,
  };
}
