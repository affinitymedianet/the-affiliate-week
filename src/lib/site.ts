export const SITE_NAME = "The Affiliate Week";
/** Canonical origin. Override per-environment with VITE_SITE_URL in `.env`. */
export const SITE_URL =
  (import.meta.env.VITE_SITE_URL as string | undefined) || "https://theaffiliateweek.com";
export const CONTACT_EMAIL = "hello@theaffiliateweek.com";
export const TYPEFORM_SUBMIT_URL = "https://form.typeform.com/to/REPLACE_ME";
