import { COLLECTIONS } from "@/integrations/firebase/config";
import { fsGet, fsQuery, type Row } from "@/integrations/firebase/firestore";

export type JobListing = {
  id: string;
  title: string;
  company: string;
  location: string;
  workType: string;
  employmentType: string;
  salaryRange: string | null;
  summary: string;
  description: string;
  applyUrl: string | null;
  postedOn: string;
  expiresOn: string | null;
  featured: boolean;
};

function safeUrl(url: unknown): string | null {
  if (typeof url !== "string" || !url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

const str = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

function toDto(row: Row): JobListing {
  return {
    id: String(row.id),
    title: str(row.title),
    company: str(row.company),
    location: str(row.location),
    workType: str(row.work_type, "Remote"),
    employmentType: str(row.employment_type, "Full-time"),
    salaryRange: str(row.salary_range) || null,
    summary: str(row.summary),
    description: str(row.description),
    applyUrl: safeUrl(row.apply_url),
    postedOn: str(row.posted_on),
    expiresOn: str(row.expires_on) || null,
    featured: row.featured === true,
  };
}

/** Published and past its scheduled publish time. */
export function isLive(row: Row): boolean {
  if (row.published !== true) return false;
  const publishAt = str(row.publish_at);
  return !publishAt || publishAt <= new Date().toISOString();
}

export async function listJobs(): Promise<JobListing[]> {
  const rows = await fsQuery(COLLECTIONS.jobs, {
    where: [{ field: "published", op: "EQUAL", value: true }],
    limit: 1000,
  });
  return rows
    .filter(isLive)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured === true ? -1 : 1;
      return str(b.posted_on).localeCompare(str(a.posted_on));
    })
    .map(toDto);
}

export async function getJob({ data }: { data: { id: string } }): Promise<JobListing | null> {
  if (!data.id) return null;
  const row = await fsGet(COLLECTIONS.jobs, data.id);
  if (!row || !isLive(row)) return null;
  return toDto(row);
}
