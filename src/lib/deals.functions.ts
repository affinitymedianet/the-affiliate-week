import { COLLECTIONS } from "@/integrations/firebase/config";
import { fsGet, fsQuery, type Row } from "@/integrations/firebase/firestore";
import { isLive } from "./jobs.functions";

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

const str = (value: unknown, fallback = "") => (typeof value === "string" ? value : fallback);

function safeUrl(url: unknown): string | null {
  if (typeof url !== "string" || !url) return null;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function toDto(row: Row): Deal {
  return {
    id: String(row.id),
    title: str(row.title),
    vendor: str(row.vendor),
    category: str(row.category, "Software"),
    dealType: str(row.deal_type, "Discount"),
    discountLabel: str(row.discount_label) || null,
    summary: str(row.summary),
    description: str(row.description),
    couponCode: str(row.coupon_code) || null,
    dealUrl: safeUrl(row.deal_url),
    exclusive: row.exclusive === true,
    featured: row.featured === true,
    startsOn: str(row.starts_on),
    expiresOn: str(row.expires_on) || null,
  };
}

export async function listDeals(): Promise<Deal[]> {
  const rows = await fsQuery(COLLECTIONS.deals, {
    where: [{ field: "published", op: "EQUAL", value: true }],
    limit: 1000,
  });
  return rows
    .filter(isLive)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured === true ? -1 : 1;
      return str(b.created_at).localeCompare(str(a.created_at));
    })
    .map(toDto);
}

export async function getDeal({ data }: { data: { id: string } }): Promise<Deal | null> {
  if (!data.id) return null;
  const row = await fsGet(COLLECTIONS.deals, data.id);
  if (!row || !isLive(row)) return null;
  return toDto(row);
}
