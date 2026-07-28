import { COLLECTIONS } from "@/integrations/firebase/config";
import { fsQuery, type Row } from "@/integrations/firebase/firestore";
import { isLive } from "./jobs.functions";

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

const str = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

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
  const parsed =
    typeof raw === "string"
      ? (() => {
          try {
            return JSON.parse(raw);
          } catch {
            return [];
          }
        })()
      : raw;
  if (!Array.isArray(parsed)) return [];
  return parsed
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

function toDto(row: Row): Issue {
  const issueDate = str(row.issue_date);
  return {
    id: String(row.id),
    slug: str(row.slug),
    number: Number(row.number ?? 0),
    title: str(row.title),
    summary: str(row.summary),
    readingTime: str(row.reading_time, "5 min read"),
    coverUrl: str(row.cover_url) || null,
    isoDate: issueDate,
    date: formatDate(issueDate),
    sections: toSections(row.sections),
  };
}

export async function listIssues(): Promise<Issue[]> {
  const rows = await fsQuery(COLLECTIONS.issues, {
    where: [{ field: "published", op: "EQUAL", value: true }],
    limit: 1000,
  });
  return rows
    .filter(isLive)
    .sort((a, b) => Number(b.number ?? 0) - Number(a.number ?? 0))
    .map(toDto);
}

export async function getIssue({ data }: { data: { slug: string } }): Promise<Issue | null> {
  const slug = String(data.slug ?? "").slice(0, 120);
  if (!slug) return null;
  const rows = await fsQuery(COLLECTIONS.issues, {
    where: [
      { field: "published", op: "EQUAL", value: true },
      { field: "slug", op: "EQUAL", value: slug },
    ],
    limit: 1,
  });
  const row = rows.find(isLive);
  return row ? toDto(row) : null;
}

export async function getLatestIssue(): Promise<Issue | null> {
  const issues = await listIssues();
  return issues[0] ?? null;
}
