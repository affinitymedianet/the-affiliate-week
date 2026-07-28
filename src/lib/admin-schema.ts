export type AdminRow = Record<string, string | number | boolean | null>;

export type FieldType =
  | "text"
  | "textarea"
  | "date"
  | "datetime"
  | "boolean"
  | "select"
  | "url"
  | "number"
  | "json"
  | "image";

export type FieldDef = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  help?: string;
  /** Hide from the compact table view. */
  hideInTable?: boolean;
};

export type EntityKey = "jobs" | "deals" | "events" | "issues";

export type EntityDef = {
  key: EntityKey;
  table: string;
  singular: string;
  plural: string;
  titleField: string;
  subtitleField: string;
  orderBy: { column: string; ascending: boolean };
  fields: FieldDef[];
};

const JOB_FIELDS: FieldDef[] = [
  { name: "title", label: "Job title", type: "text", required: true },
  { name: "company", label: "Company", type: "text", required: true },
  { name: "location", label: "Location", type: "text", required: true },
  {
    name: "work_type",
    label: "Work type",
    type: "select",
    options: ["Remote", "Hybrid", "On-site"],
    required: true,
  },
  {
    name: "employment_type",
    label: "Employment type",
    type: "select",
    options: ["Full-time", "Part-time", "Contract", "Freelance", "Internship"],
    required: true,
  },
  { name: "salary_range", label: "Salary range", type: "text" },
  { name: "summary", label: "Summary", type: "textarea", required: true },
  { name: "description", label: "Description", type: "textarea", required: true, hideInTable: true },
  { name: "apply_url", label: "Apply URL", type: "url", required: true },
  { name: "posted_on", label: "Posted on", type: "date" },
  { name: "expires_on", label: "Expires on", type: "date", help: "Leave blank for no expiry." },
  { name: "featured", label: "Featured", type: "boolean" },
  {
    name: "publish_at",
    label: "Scheduled go-live",
    type: "datetime",
    hideInTable: true,
    help: "Leave blank to go live immediately once published.",
  },
  { name: "published", label: "Published", type: "boolean" },
];

const DEAL_FIELDS: FieldDef[] = [
  { name: "title", label: "Deal title", type: "text", required: true },
  { name: "vendor", label: "Vendor", type: "text", required: true },
  {
    name: "category",
    label: "Category",
    type: "select",
    options: ["Software", "Tools", "Proxies", "Hosting", "Tracking", "Education", "Other"],
    required: true,
  },
  {
    name: "deal_type",
    label: "Deal type",
    type: "select",
    options: ["Discount", "Free trial", "Credit", "Lifetime", "Bundle"],
    required: true,
  },
  { name: "discount_label", label: "Discount label", type: "text", help: "e.g. 30% off" },
  { name: "summary", label: "Summary", type: "textarea", required: true },
  { name: "description", label: "Description", type: "textarea", required: true, hideInTable: true },
  { name: "coupon_code", label: "Coupon code", type: "text" },
  { name: "deal_url", label: "Deal URL", type: "url", required: true },
  { name: "starts_on", label: "Starts on", type: "date" },
  { name: "expires_on", label: "Expires on", type: "date" },
  { name: "exclusive", label: "Exclusive", type: "boolean" },
  { name: "featured", label: "Featured", type: "boolean" },
  {
    name: "publish_at",
    label: "Scheduled go-live",
    type: "datetime",
    hideInTable: true,
    help: "Leave blank to go live immediately once published.",
  },
  { name: "published", label: "Published", type: "boolean" },
];

const EVENT_FIELDS: FieldDef[] = [
  { name: "name", label: "Event name", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true, help: "Used in the URL." },
  { name: "starts_on", label: "Date", type: "date", required: true },
  { name: "location", label: "Location", type: "text", required: true, help: 'Use "Online" for virtual events.' },
  {
    name: "format",
    label: "Format",
    type: "select",
    options: ["Conference", "Meetup", "Webinar", "Summit"],
    required: true,
  },
  { name: "price", label: "Price", type: "text", required: true, help: 'e.g. Free or From $499' },
  { name: "description", label: "Description", type: "textarea", required: true },
  {
    name: "image_key",
    label: "Cover style",
    type: "select",
    options: ["conference", "meetup", "webinar", "summit"],
    hideInTable: true,
  },
  { name: "image_url", label: "Custom cover image", type: "image", hideInTable: true },
  { name: "event_url", label: "Official event URL", type: "url" },
  { name: "featured", label: "Featured", type: "boolean" },
  {
    name: "publish_at",
    label: "Scheduled go-live",
    type: "datetime",
    hideInTable: true,
    help: "Leave blank to go live immediately once published.",
  },
  { name: "published", label: "Published", type: "boolean" },
];

const ISSUE_FIELDS: FieldDef[] = [
  { name: "number", label: "Issue number", type: "number", required: true },
  { name: "title", label: "Title", type: "text", required: true },
  { name: "slug", label: "Slug", type: "text", required: true, help: "Used in the URL." },
  { name: "issue_date", label: "Issue date", type: "date", required: true },
  { name: "reading_time", label: "Reading time", type: "text", help: 'e.g. 5 min read' },
  { name: "summary", label: "Summary", type: "textarea", required: true },
  { name: "cover_url", label: "Cover image", type: "image", hideInTable: true },
  {
    name: "sections",
    label: "Issue body",
    type: "json",
    hideInTable: true,
    help: 'Sections as JSON: [{"heading":"Industry news","items":[{"title":"…","body":"…"}]}]',
  },
  {
    name: "publish_at",
    label: "Scheduled go-live",
    type: "datetime",
    hideInTable: true,
    help: "Leave blank to go live immediately once published.",
  },
  { name: "published", label: "Published", type: "boolean" },
];

export const ENTITIES: Record<EntityKey, EntityDef> = {
  jobs: {
    key: "jobs",
    table: "jobs",
    singular: "job",
    plural: "Jobs",
    titleField: "title",
    subtitleField: "company",
    orderBy: { column: "posted_on", ascending: false },
    fields: JOB_FIELDS,
  },
  deals: {
    key: "deals",
    table: "deals",
    singular: "deal",
    plural: "Deals",
    titleField: "title",
    subtitleField: "vendor",
    orderBy: { column: "created_at", ascending: false },
    fields: DEAL_FIELDS,
  },
  events: {
    key: "events",
    table: "events",
    singular: "event",
    plural: "Events",
    titleField: "name",
    subtitleField: "location",
    orderBy: { column: "starts_on", ascending: true },
    fields: EVENT_FIELDS,
  },
  issues: {
    key: "issues",
    table: "issues",
    singular: "issue",
    plural: "Issues",
    titleField: "title",
    subtitleField: "issue_date",
    orderBy: { column: "number", ascending: false },
    fields: ISSUE_FIELDS,
  },
};

export function isEntityKey(value: unknown): value is EntityKey {
  return value === "jobs" || value === "deals" || value === "events" || value === "issues";
}

export function emptyRecord(entity: EntityDef): AdminRow {
  const out: AdminRow = {};
  for (const field of entity.fields) {
    if (field.type === "boolean") out[field.name] = field.name === "published";
    else if (field.type === "select") out[field.name] = field.options?.[0] ?? "";
    else if (field.type === "json") out[field.name] = "[]";
    else out[field.name] = "";
  }
  return out;
}

/** Coerce raw string values (form or CSV) into the types the database expects. */
export function coerceRecord(entity: EntityDef, raw: AdminRow): AdminRow {
  const out: AdminRow = {};
  for (const field of entity.fields) {
    if (!(field.name in raw)) continue;
    const value = raw[field.name];
    if (field.type === "json") {
      if (value == null || String(value).trim() === "") {
        out[field.name] = null;
      } else if (typeof value === "string") {
        try {
          out[field.name] = JSON.parse(value) as never;
        } catch {
          throw new Error(`${field.label} must be valid JSON`);
        }
      } else {
        out[field.name] = value;
      }
    } else if (field.type === "boolean") {
      out[field.name] =
        typeof value === "boolean"
          ? value
          : ["true", "yes", "1", "y"].includes(String(value ?? "").trim().toLowerCase());
    } else {
      const str = value == null ? "" : String(value).trim();
      out[field.name] = str === "" ? (field.required ? "" : null) : str;
    }
  }
  return out;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
