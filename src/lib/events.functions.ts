import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { AffiliateEvent } from "@/data/events";

const COLUMNS =
  "slug, name, starts_on, location, format, price, description, image_key, image_url, event_url, featured";

type EventRow = {
  slug: string;
  name: string;
  starts_on: string;
  location: string;
  format: string;
  price: string;
  description: string;
  image_key: string;
  image_url: string | null;
  event_url: string | null;
  featured: boolean;
};

function safeUrl(url: string | null): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

function toDto(row: EventRow): AffiliateEvent {
  const d = new Date(`${row.starts_on}T00:00:00Z`);
  return {
    id: row.slug,
    name: row.name,
    isoDate: row.starts_on,
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
    location: row.location,
    format: row.format,
    price: row.price,
    description: row.description,
    imageKey: row.image_key,
    imageUrl: safeUrl(row.image_url) ?? null,
    url: safeUrl(row.event_url),
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

export const listEvents = createServerFn({ method: "GET" }).handler(
  async (): Promise<AffiliateEvent[]> => {
    const supabase = getPublicClient();
    const { data, error } = await supabase
      .from("events")
      .select(COLUMNS)
      .eq("published", true)
      .or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`)
      .order("starts_on", { ascending: true });

    if (error) throw new Error(error.message);
    return ((data ?? []) as EventRow[]).map(toDto);
  },
);

export const getEvent = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }): Promise<AffiliateEvent | null> => {
    const supabase = getPublicClient();
    const { data: row, error } = await supabase
      .from("events")
      .select(COLUMNS)
      .eq("published", true)
      .or(`publish_at.is.null,publish_at.lte.${new Date().toISOString()}`)
      .eq("slug", data.slug)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return row ? toDto(row as EventRow) : null;
  });
