import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type Deal = {
  id: string;
  title: string;
  vendor: string;
  category: string;
  dealType: string;
  discountLabel: string | null;
  summary: string;
  description: string;
  couponCode: string | null;
  dealUrl: string | null;
  exclusive: boolean;
  featured: boolean;
  startsOn: string;
  expiresOn: string | null;
};

const COLUMNS =
  "id, title, vendor, category, deal_type, discount_label, summary, description, coupon_code, deal_url, exclusive, featured, starts_on, expires_on";

type DealRow = {
  id: string;
  title: string;
  vendor: string;
  category: string;
  deal_type: string;
  discount_label: string | null;
  summary: string;
  description: string;
  coupon_code: string | null;
  deal_url: string;
  exclusive: boolean;
  featured: boolean;
  starts_on: string;
  expires_on: string | null;
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

function toDto(row: DealRow): Deal {
  return {
    id: row.id,
    title: row.title,
    vendor: row.vendor,
    category: row.category,
    dealType: row.deal_type,
    discountLabel: row.discount_label,
    summary: row.summary,
    description: row.description,
    couponCode: row.coupon_code,
    dealUrl: safeUrl(row.deal_url),
    exclusive: row.exclusive,
    featured: row.featured,
    startsOn: row.starts_on,
    expiresOn: row.expires_on,
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

export const listDeals = createServerFn({ method: "GET" }).handler(async (): Promise<Deal[]> => {
  const supabase = getPublicClient();
  const { data, error } = await supabase
    .from("deals")
    .select(COLUMNS)
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return ((data ?? []) as DealRow[]).map(toDto);
});

export const getDeal = createServerFn({ method: "GET" })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }): Promise<Deal | null> => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(data.id);
    if (!isUuid) return null;
    const supabase = getPublicClient();
    const { data: row, error } = await supabase
      .from("deals")
      .select(COLUMNS)
      .eq("published", true)
      .eq("id", data.id)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return row ? toDto(row as DealRow) : null;
  });
