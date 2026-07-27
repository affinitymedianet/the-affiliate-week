import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, MapPin } from "lucide-react";

import { events } from "@/data/events";
import { listJobs } from "@/lib/jobs.functions";
import { listDeals } from "@/lib/deals.functions";

function SectionHead({
  label,
  title,
  href,
  linkLabel,
}: {
  label: string;
  title: string;
  href: "/events" | "/jobs" | "/deals";
  linkLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-rule pb-3">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">{label}</p>
        <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      <Link
        to={href}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        {linkLabel} <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

export function WeeklyBoards() {
  const { data: jobs = [] } = useQuery({ queryKey: ["jobs"], queryFn: () => listJobs() });
  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => listDeals() });

  const upcoming = events.slice(0, 4);

  return (
    <section className="border-b border-rule bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-6xl space-y-14 px-4">
        <div>
          <SectionHead
            label="Events"
            title="On the calendar"
            href="/events"
            linkLabel="All events"
          />
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {upcoming.map((event) => (
              <li key={event.id} className="flex gap-4 border-l-2 border-signal bg-card p-4">
                <div className="text-center">
                  <p className="font-display text-2xl font-bold leading-none">
                    {event.dateLabel.day}
                  </p>
                  <p className="text-xs font-semibold uppercase text-muted-foreground">
                    {event.dateLabel.month}
                  </p>
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold leading-snug">
                    <Link
                      to="/events/$eventId"
                      params={{ eventId: event.id }}
                      className="hover:underline"
                    >
                      {event.name}
                    </Link>
                  </h3>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="size-3.5" /> {event.location}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHead
              label="Jobs"
              title="Hiring this week"
              href="/jobs"
              linkLabel="All jobs"
            />
            <ul className="divide-y divide-rule">
              {jobs.slice(0, 4).map((job) => (
                <li key={job.id} className="flex items-baseline justify-between gap-4 py-4">
                  <div>
                    <h3 className="font-display text-base font-semibold">
                      <Link
                        to="/jobs/$jobId"
                        params={{ jobId: job.id }}
                        className="hover:underline"
                      >
                        {job.title}
                      </Link>
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {job.company} · {job.location}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {job.workType}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <SectionHead
              label="Deals"
              title="Tools worth the discount"
              href="/deals"
              linkLabel="All deals"
            />
            <ul className="divide-y divide-rule">
              {deals.slice(0, 4).map((deal) => (
                <li key={deal.id} className="flex items-baseline justify-between gap-4 py-4">
                  <div>
                    <h3 className="font-display text-base font-semibold">
                      <Link
                        to="/deals/$dealId"
                        params={{ dealId: deal.id }}
                        className="hover:underline"
                      >
                        {deal.title}
                      </Link>
                    </h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {deal.vendor} · {deal.category}
                    </p>
                  </div>
                  {deal.discountLabel ? (
                    <span className="shrink-0 font-display text-sm font-bold text-signal">
                      {deal.discountLabel}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
