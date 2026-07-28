import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type IssueSection = {
  heading: string;
  items: { title: string; body: string }[];
};

export type Issue = {
  id: string;
  slug: string;
  number: number;
  title: string;
  summary: string;
  readingTime: string;
  coverUrl: string | null;
  isoDate: string;
  date: string;
  sections: IssueSection[];
};

const COLUMNS =
  "id, slug, number, title, summary, reading_time, cover_url, issue_date, sections";

type IssueRow = {
  id: string;
  slug: string;
  number: number;
  title: string;
  summary: string;
  reading_time: string;
  cover_url: string | null;
  issue_date: string;
  sections: unknown;
};

function formatDate(iso: string): string {
  const parsed = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return iso;
  return parsed.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function toSections(raw: unknown): IssueSection[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((s): s is { heading?: unknown; items?: unknown } => !!s && typeof s === "object")
    .map((s) => ({
      heading: String((s as { heading?: unknown }).heading ?? ""),
      items: Array.isArray((s as { items?: unknown }).items)
        ? ((s as { items: unknown[] }).items as { title?: unknown; body?: unknown }[]).map(
            (item) => ({
              title: String(item?.title ?? ""),
              body: String(item?.body ?? ""),
            }),
          )
        : [],
    }))
    .filter((s) => s.heading || s.items.length > 0);
}

function toDto(row: IssueRow): Issue {
  return {
    id: row.id,
    slug: row.slug,
    number: row.number,
    title: row.title,
    summary: row.summary,
    readingTime: row.reading_time,
    coverUrl: row.cover_url,
    isoDate: row.issue_date,
    date: formatDate(row.issue_date),
    sections: toSections(row.sections),
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

export const listIssues = createServerFn({ method: "GET" }).handler(async (): Promise<Issue[]> => {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("issues")
    .select(COLUMNS)
    .eq("published", true)
    .or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`)
    .order("number", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as IssueRow[]).map(toDto);
});

export const getIssue = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => ({ slug: String(data.slug ?? "").slice(0, 120) }))
  .handler(async ({ data }): Promise<Issue | null> => {
    if (!data.slug) return null;
    const supabase = getPublicClient();
    const { data: row, error } = await supabase
      .from("issues")
      .select(COLUMNS)
      .eq("published", true)
      .or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`)
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return row ? toDto(row as IssueRow) : null;
  });
