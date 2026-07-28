import type { AffiliateEvent } from "@/data/events";
import { COLLECTIONS } from "@/integrations/firebase/config";
import { fsQuery, type Row } from "@/integrations/firebase/firestore";
import { isLive } from "./jobs.functions";

const str = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

function safeUrl(url: unknown): string | undefined {
  if (typeof url !== "string" || !url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:"
      ? parsed.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function toDto(row: Row): AffiliateEvent {
  const startsOn = str(row.starts_on);
  const d = new Date(`${startsOn}T00:00:00Z`);
  return {
    id: str(row.slug, String(row.id)),
    name: str(row.name),
    isoDate: startsOn,
    date: d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }),
    dateLabel: {
      day: String(d.getUTCDate()).padStart(2, "0"),
      month: d.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" }),
    },
    location: str(row.location),
    format: str(row.format, "Conference"),
    price: str(row.price, "Free"),
    description: str(row.description),
    imageKey: str(row.image_key, "conference"),
    imageUrl: safeUrl(row.image_url) ?? null,
    url: safeUrl(row.event_url),
    featured: row.featured === true,
  };
}

export async function listEvents(): Promise<AffiliateEvent[]> {
  const rows = await fsQuery(COLLECTIONS.events, {
    where: [{ field: "published", op: "EQUAL", value: true }],
    limit: 1000,
  });
  return rows
    .filter(isLive)
    .sort((a, b) => str(a.starts_on).localeCompare(str(b.starts_on)))
    .map(toDto);
}

export async function getEvent({
  data,
}: {
  data: { slug: string };
}): Promise<AffiliateEvent | null> {
  if (!data.slug) return null;
  const rows = await fsQuery(COLLECTIONS.events, {
    where: [
      { field: "published", op: "EQUAL", value: true },
      { field: "slug", op: "EQUAL", value: data.slug },
    ],
    limit: 1,
  });
  const row = rows.find(isLive);
  return row ? toDto(row) : null;
}
