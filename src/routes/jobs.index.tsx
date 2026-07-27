import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { MapPin, Building2, Briefcase, Banknote, ArrowRight } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Pager, paginate } from "@/components/site/Pager";
import { Button } from "@/components/ui/button";
import { listJobs } from "@/lib/jobs.functions";

const title = "Affiliate marketing jobs board — The Affiliate Week";
const description =
  "Open affiliate marketing, partnerships and performance roles — remote, hybrid and onsite. Apply directly with the employer. Updated weekly.";

const jobsQueryOptions = queryOptions({
  queryKey: ["jobs"],
  queryFn: () => listJobs(),
});

type JobsSearch = { q: string; work: string; type: string; page: number };

export const Route = createFileRoute("/jobs/")({
  validateSearch: (search: Record<string, unknown>): JobsSearch => ({
    q: typeof search.q === "string" ? search.q : "",
    work: typeof search.work === "string" ? search.work : "All",
    type: typeof search.type === "string" ? search.type : "All",
    page: Number(search.page) > 0 ? Math.floor(Number(search.page)) : 1,
  }),
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(jobsQueryOptions);
  },
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/jobs" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/jobs" }],
  }),
  component: JobsPage,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center" role="alert">
      <h1 className="font-display text-2xl font-bold">We couldn't load the jobs board</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">No jobs found</h1>
    </div>
  ),
});

const workTypes = ["All", "Remote", "Hybrid", "Onsite"] as const;
const employmentTypes = ["All", "Full-time", "Contract", "Part-time"] as const;

function formatPosted(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function JobsPage() {
  const { data: jobs } = useSuspenseQuery(jobsQueryOptions);
  const { q: query, work: workType, type: employment, page } = Route.useSearch();
  const navigate = useNavigate({ from: "/jobs" });
  const setSearch = (next: Partial<JobsSearch>) =>
    navigate({ search: (prev: JobsSearch) => ({ ...prev, page: 1, ...next }) });

  const filtered = useMemo(
    () =>
      jobs.filter((job) => {
        if (workType !== "All" && job.workType !== workType) return false;
        if (employment !== "All" && job.employmentType !== employment) return false;
        if (query.trim()) {
          const q = query.trim().toLowerCase();
          const haystack = `${job.title} ${job.company} ${job.location}`.toLowerCase();
          if (!haystack.includes(q)) return false;
        }
        return true;
      }),
    [jobs, workType, employment, query],
  );

  const paged = paginate(filtered, page);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-background py-14 lg:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <Breadcrumbs items={[{ label: "Jobs" }]} />
            <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
              Affiliate marketing jobs
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              {jobs.length} open roles across affiliate management, partnerships and performance
              marketing. Every listing links straight to the employer's own application page.
            </p>
            <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link to="/submit" className="font-medium text-primary hover:underline">
                Post a role →
              </Link>
              <Link to="/events" className="font-medium text-primary hover:underline">
                Browse events →
              </Link>
              <Link to="/deals" className="font-medium text-primary hover:underline">
                See deals →
              </Link>
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-4xl px-4">
            <div className="flex flex-wrap items-center gap-2">
              {workTypes.map((w) => (
                <Button
                  key={w}
                  type="button"
                  size="sm"
                  variant={workType === w ? "default" : "outline"}
                  onClick={() => setSearch({ work: w })}
                >
                  {w}
                </Button>
              ))}
              <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
              {employmentTypes.map((e) => (
                <Button
                  key={e}
                  type="button"
                  size="sm"
                  variant={employment === e ? "secondary" : "ghost"}
                  onClick={() => setSearch({ type: e })}
                >
                  {e}
                </Button>
              ))}
            </div>

            <label className="mt-4 block">
              <span className="sr-only">Search jobs by title, company or location</span>
              <input
                type="search"
                value={query}
                onChange={(e) => setSearch({ q: e.target.value })}
                placeholder="Search by title, company or location"
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
              />
            </label>

            <p className="mt-4 text-sm text-muted-foreground">
              Showing {paged.items.length ? paged.start + 1 : 0}–{paged.end} of {filtered.length}{" "}
              roles
            </p>

            <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card shadow-card">
              {paged.items.map((job) => (
                <li key={job.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                        {job.workType}
                      </span>
                      {job.featured ? (
                        <span className="rounded-full bg-navy px-2.5 py-0.5 text-xs font-medium text-navy-foreground">
                          Featured
                        </span>
                      ) : null}
                    </div>
                    <h2 className="mt-2 font-display text-lg font-semibold">
                      <Link
                        to="/jobs/$jobId"
                        params={{ jobId: job.id }}
                        className="hover:underline"
                      >
                        {job.title}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">{job.summary}</p>
                    <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Building2 className="size-4" />
                        {job.company}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="size-4" />
                        {job.location}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Briefcase className="size-4" />
                        {job.employmentType}
                      </span>
                      {job.salaryRange ? (
                        <span className="flex items-center gap-1.5">
                          <Banknote className="size-4" />
                          {job.salaryRange}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Posted {formatPosted(job.postedOn)}
                    </p>
                  </div>
                  <Link
                    to="/jobs/$jobId"
                    params={{ jobId: job.id }}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    View & apply <ArrowRight className="size-4" />
                  </Link>
                </li>
              ))}
            </ul>

            {filtered.length === 0 ? (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                No roles match those filters right now.
              </p>
            ) : null}

            <Pager
              page={paged.page}
              totalPages={paged.totalPages}
              onPageChange={(p) => navigate({ search: (prev: JobsSearch) => ({ ...prev, page: p }) })}
              label="Jobs pagination"
            />

            <div className="mt-12 rounded-xl border border-border bg-background p-6 text-center">
              <h2 className="font-display text-xl font-semibold">New affiliate roles, weekly</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Jobs go out in the newsletter every Thursday, alongside industry news and events.
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
