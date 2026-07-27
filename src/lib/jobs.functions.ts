import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

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

const COLUMNS =
  "id, title, company, location, work_type, employment_type, salary_range, summary, description, apply_url, posted_on, expires_on, featured";

type JobRow = {
  id: string;
  title: string;
  company: string;
  location: string;
  work_type: string;
  employment_type: string;
  salary_range: string | null;
  summary: string;
  description: string;
  apply_url: string | null;
  posted_on: string;
  expires_on: string | null;
  featured: boolean;
};

function safeUrl(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function toDto(row: JobRow): JobListing {
  return {
    id: row.id,
    title: row.title,
    company: row.company,
    location: row.location,
    workType: row.work_type,
    employmentType: row.employment_type,
    salaryRange: row.salary_range,
    summary: row.summary,
    description: row.description,
    applyUrl: safeUrl(row.apply_url),
    postedOn: row.posted_on,
    expiresOn: row.expires_on,
    featured: row.featured,
  };
}

function getPublicClient() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(url, key, {
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
}

export const listJobs = createServerFn({ method: "GET" }).handler(async (): Promise<JobListing[]> => {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("jobs")
    .select(COLUMNS)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("posted_on", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as JobRow[]).map(toDto);
});

export const getJob = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<JobListing | null> => {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id);
    if (!isUuid) return null;
    const supabase = getPublicClient();
    const { data: row, error } = await supabase
      .from("jobs")
      .select(COLUMNS)
      .eq("published", true)
      .eq("id", data.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return row ? toDto(row as JobRow) : null;
  });
