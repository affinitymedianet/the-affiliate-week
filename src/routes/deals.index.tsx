import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Tag, Sparkles, ArrowRight, BadgePercent } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Pager, paginate } from "@/components/site/Pager";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Button } from "@/components/ui/button";
import { listDeals } from "@/lib/deals.functions";

const title = "Exclusive affiliate marketing deals — software, tools & proxies | AffiliateX";
const description =
  "Hand-checked discounts on affiliate software, SEO tools, proxies, trackers and hosting. Exclusive codes for AffiliateX readers, updated weekly.";

const dealsQueryOptions = queryOptions({
  queryKey: ["deals"],
  queryFn: () => listDeals(),
});

const categories = [
  "All",
  "Software",
  "Tools",
  "Proxies",
  "Tracking",
  "Hosting",
  "Education",
] as const;

type DealsSearch = { q: string; category: string; page: number };

export const Route = createFileRoute("/deals/")({
  validateSearch: (search: Record<string, unknown>): DealsSearch => ({
    q: typeof search.q === "string" ? search.q : "",
    category: typeof search.category === "string" ? search.category : "All",
    page: Number(search.page) > 0 ? Math.floor(Number(search.page)) : 1,
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(dealsQueryOptions);
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/deals" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/deals" }],
  }),
  component: DealsPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center" role="alert">
      <h1 className="font-display text-2xl font-bold">We couldn't load the deals</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">No deals found</h1>
    </div>
  ),
});

function DealsPage() {
  const { data: deals } = useSuspenseQuery(dealsQueryOptions);
  const { q, category, page } = Route.useSearch();
  const navigate = useNavigate({ from: "/deals" });

  const setSearch = (next: Partial<DealsSearch>) =>
    navigate({ search: (prev: DealsSearch) => ({ ...prev, page: 1, ...next }) });

  const filtered = useMemo(
    () =>
      deals.filter((deal) => {
        if (category !== "All" && deal.category !== category) return false;
        if (q.trim()) {
          const needle = q.trim().toLowerCase();
          const haystack =
            `${deal.title} ${deal.vendor} ${deal.category} ${deal.summary}`.toLowerCase();
          if (!haystack.includes(needle)) return false;
        }
        return true;
      }),
    [deals, category, q],
  );

  const paged = paginate(filtered, page);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-surface py-14 lg:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <Breadcrumbs items={[{ label: "Deals" }]} />
            <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
              Exclusive affiliate deals
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Discounts on the software, tools, proxies and trackers affiliates actually use. Every
              deal is checked before it goes live and re-checked when it expires.
            </p>
            <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link to="/submit" className="font-medium text-primary hover:underline">
                Submit a deal →
              </Link>
              <Link to="/jobs" className="font-medium text-primary hover:underline">
                Browse jobs →
              </Link>
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-5xl px-4">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((c) => (
                <Button
                  key={c}
                  type="button"
                  size="sm"
                  variant={category === c ? "default" : "outline"}
                  onClick={() => setSearch({ category: c })}
                >
                  {c}
                </Button>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="sr-only">Search deals by tool, vendor or category</span>
              <input
                type="search"
                value={q}
                onChange={(e) => setSearch({ q: e.target.value })}
                placeholder="Search deals by tool, vendor or category"
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
              />
            </label>

            <p className="mt-4 text-sm text-muted-foreground">
              Showing {paged.items.length ? paged.start + 1 : 0}–{paged.end} of {filtered.length}{" "}
              deals
            </p>

            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {paged.items.map((deal) => (
                <li
                  key={deal.id}
                  className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-lift"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                      {deal.category}
                    </span>
                    {deal.exclusive ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-0.5 text-xs font-medium text-navy-foreground">
                        <Sparkles className="size-3" /> Exclusive
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 font-display text-lg font-semibold">
                    <Link
                      to="/deals/$dealId"
                      params={{ dealId: deal.id }}
                      className="hover:underline"
                    >
                      {deal.title}
                    </Link>
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">{deal.summary}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Tag className="size-4" />
                      {deal.vendor}
                    </span>
                    {deal.discountLabel ? (
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <BadgePercent className="size-4" />
                        {deal.discountLabel}
                      </span>
                    ) : null}
                  </div>
                  <Link
                    to="/deals/$dealId"
                    params={{ dealId: deal.id }}
                    className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    View deal <ArrowRight className="size-4" />
                  </Link>
                </li>
              ))}
            </ul>

            {filtered.length === 0 ? (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                No deals match that search yet. Try clearing the filters.
              </p>
            ) : null}

            <Pager
              page={paged.page}
              totalPages={paged.totalPages}
              onPageChange={(p) => navigate({ search: (prev: DealsSearch) => ({ ...prev, page: p }) })}
              label="Deals pagination"
            />

            <div className="mt-12 rounded-xl border border-border bg-surface p-6 text-center">
              <h2 className="font-display text-xl font-semibold">New deals every Thursday</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Exclusive codes go to subscribers first, alongside jobs, events and industry news.
              </p>
              <div className="mx-auto mt-5 max-w-md">
                <NewsletterForm source="footer" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
