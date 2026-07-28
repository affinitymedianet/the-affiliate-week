import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";

import { useLatestIssue } from "@/hooks/use-latest-issue";
import { listJobs } from "@/lib/jobs.functions";
import { listDeals } from "@/lib/deals.functions";

export function InsideThisIssue() {
  const latestIssue = useLatestIssue();
  const { data: jobs = [] } = useQuery({ queryKey: ["jobs"], queryFn: () => listJobs() });
  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => listDeals() });

  const headlines = (latestIssue?.sections ?? [])
    .flatMap((section) => section.items.map((item) => ({ ...item, section: section.heading })))
    .slice(0, 3);

  const job = jobs[0];
  const deal = deals[0];

  return (
    <section className="border-b border-rule py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-4">
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Inside the latest issue
          </h2>
          {latestIssue ? (
            <Link
              to="/issues/$slug"
              params={{ slug: latestIssue.slug }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Read the full issue <ArrowRight className="size-4" />
            </Link>
          ) : null}
        </div>

        <div className="grid gap-10 pt-8 lg:grid-cols-[1.4fr_1fr]">
          <ol className="divide-y divide-rule">
            {headlines.map((item, i) => (
              <li key={item.title} className="flex gap-5 py-5 first:pt-0">
                <span className="font-display text-2xl font-bold text-signal">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {item.section}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-semibold leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div className="space-y-4">
            {job ? (
              <div className="border border-rule bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-signal">
                  Job of the week
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold">
                  <Link to="/jobs/$jobId" params={{ jobId: job.id }} className="hover:underline">
                    {job.title}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {job.company} · {job.location}
                </p>
              </div>
            ) : null}

            {deal ? (
              <div className="border border-rule bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-signal">
                  Deal of the week
                </p>
                <h3 className="mt-2 font-display text-lg font-semibold">
                  <Link to="/deals/$dealId" params={{ dealId: deal.id }} className="hover:underline">
                    {deal.title}
                  </Link>
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {deal.vendor}
                  {deal.discountLabel ? ` · ${deal.discountLabel}` : ""}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
