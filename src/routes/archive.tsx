import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Pager, paginate } from "@/components/site/Pager";
import { listIssues } from "@/lib/issues.functions";

const title = "The Affiliate Week newsletter archive — read past issues";
const description =
  "Read The Affiliate Week issues in full before you subscribe: affiliate industry news, new programmes, jobs and events, published every Thursday.";

type ArchiveSearch = { q: string; page: number };

export const Route = createFileRoute("/archive")({
  validateSearch: (search: Record<string, unknown>): ArchiveSearch => ({
    q: typeof search.q === "string" ? search.q : "",
    page: Number(search.page) > 0 ? Math.floor(Number(search.page)) : 1,
  }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/archive" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/archive" }],
  }),
  component: ArchivePage,
});

function ArchivePage() {
  const { q, page } = Route.useSearch();
  const navigate = useNavigate({ from: "/archive" });
  const { data: issues = [], isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: () => listIssues(),
  });

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return issues;
    return issues.filter((issue) =>
      `${issue.title} ${issue.summary} #${issue.number}`.toLowerCase().includes(needle),
    );
  }, [q, issues]);

  const paged = paginate(filtered, page);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="bg-primary text-primary-foreground py-14 lg:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: "Archive" }]} />
            <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
              Newsletter archive
            </h1>
            <p className="mt-4 max-w-2xl text-primary-foreground/85">
              Every issue is published here in full, free to read. Start with the sample issue to
              see the format, length and tone before you hand over your email address.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
            <label className="block">
              <span className="sr-only">Search past issues</span>
              <input
                type="search"
                value={q}
                onChange={(e) =>
                  navigate({
                    search: (prev: ArchiveSearch) => ({ ...prev, q: e.target.value, page: 1 }),
                  })
                }
                placeholder="Search past issues by topic or title"
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
              />
            </label>

            <p className="mt-4 text-sm text-muted-foreground">
              Showing {paged.items.length ? paged.start + 1 : 0}–{paged.end} of {filtered.length}{" "}
              issues
            </p>

            <ul className="mt-4 space-y-4">
              {paged.items.map((issue) => (
                <li key={issue.slug}>
                  <Link
                    to="/issues/$slug"
                    params={{ slug: issue.slug }}
                    className="block rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-lift"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-primary">
                      Issue #{issue.number} · {issue.readingTime}
                    </p>
                    <h2 className="mt-2 font-display text-xl font-semibold">{issue.title}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">{issue.summary}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                      Read issue <ArrowRight className="size-4" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {isLoading ? (
              <p className="mt-6 text-center text-sm text-muted-foreground">Loading issues…</p>
            ) : filtered.length === 0 ? (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                No issues match that search yet.
              </p>
            ) : null}

            <Pager
              page={paged.page}
              totalPages={paged.totalPages}
              onPageChange={(p) =>
                navigate({ search: (prev: ArchiveSearch) => ({ ...prev, page: p }) })
              }
              label="Archive pagination"
            />

            <div className="mt-12 rounded-xl border border-border bg-background p-6 text-center">
              <h2 className="font-display text-xl font-semibold">Get the next one by email</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                New issue every Thursday morning.
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
