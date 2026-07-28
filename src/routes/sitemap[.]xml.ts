import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { listDeals } from "@/lib/deals.functions";
import { listJobs } from "@/lib/jobs.functions";
import { listEvents } from "@/lib/events.functions";
import { issues } from "@/data/issues";
import { PAGE_SIZE } from "@/components/site/Pager";

import { SITE_URL } from "@/lib/site";

const BASE_URL = SITE_URL;


interface SitemapEntry {
  path: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

function paginatedPaths(basePath: string, total: number): SitemapEntry[] {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const out: SitemapEntry[] = [];
  for (let page = 1; page <= totalPages; page++) {
    out.push({
      path: page === 1 ? basePath : `${basePath}?page=${page}`,
      changefreq: "daily",
      priority: page === 1 ? "0.9" : "0.5",
    });
  }
  return out;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const [deals, jobs, events] = await Promise.all([
          listDeals().catch(() => []),
          listJobs().catch(() => []),
          listEvents().catch(() => []),
        ]);

        const entries: SitemapEntry[] = [
          { path: "/", changefreq: "daily", priority: "1.0" },
          ...paginatedPaths("/deals", deals.length),
          ...paginatedPaths("/jobs", jobs.length),
          ...paginatedPaths("/events", events.length),
          ...paginatedPaths("/archive", issues.length),
          { path: "/submit", changefreq: "monthly", priority: "0.5" },
          { path: "/sponsor", changefreq: "monthly", priority: "0.6" },
          { path: "/privacy", changefreq: "yearly", priority: "0.3" },
          { path: "/terms", changefreq: "yearly", priority: "0.3" },
          ...deals.map((d) => ({
            path: `/deals/${d.id}`,
            changefreq: "weekly" as const,
            priority: "0.7",
          })),
          ...jobs.map((j) => ({
            path: `/jobs/${j.id}`,
            changefreq: "weekly" as const,
            priority: "0.7",
          })),
          ...events.map((e) => ({
            path: `/events/${e.id}`,
            changefreq: "weekly" as const,
            priority: "0.7",
          })),
          ...issues.map((i) => ({
            path: `/issues/${i.slug}`,
            changefreq: "monthly" as const,
            priority: "0.6",
          })),
        ];

        const urls = entries.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path.replace(/&/g, "&amp;")}</loc>`,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
