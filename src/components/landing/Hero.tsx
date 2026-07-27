import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Mail, Calendar, Briefcase, Tag } from "lucide-react";

import { NewsletterForm } from "@/components/NewsletterForm";
import { sampleIssue } from "@/data/issues";
import { events } from "@/data/events";
import { listJobs } from "@/lib/jobs.functions";
import { listDeals } from "@/lib/deals.functions";
import heroBg from "@/assets/hero-bg-bands.jpg.asset.json";
import { cn } from "@/lib/utils";

function PreviewCard({
  label,
  icon: Icon,
  href,
  title,
  meta,
  accent = false,
  className,
}: {
  label: string;
  icon: React.ElementType;
  href: string;
  title: string;
  meta: string;
  accent?: boolean;
  className?: string;
}) {
  return (
    <Link
      to={href}
      className={cn(
        "group relative flex flex-col justify-between overflow-hidden rounded-2xl border p-5 shadow-sm transition-all",
        accent
          ? "border-signal/20 bg-navy text-navy-foreground hover:bg-navy-deep"
          : "border-rule bg-white/80 backdrop-blur-sm hover:border-signal/30 hover:shadow-md",
        className,
      )}
    >
      <div>
        <div
          className={cn(
            "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest",
            accent ? "text-signal" : "text-signal",
          )}
        >
          <Icon className="size-3" />
          {label}
        </div>
        <h3
          className={cn(
            "mt-3 font-display text-base font-semibold leading-snug",
            accent ? "text-navy-foreground" : "text-foreground",
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "mt-1.5 text-sm",
            accent ? "text-navy-foreground/70" : "text-muted-foreground",
          )}
        >
          {meta}
        </p>
      </div>
      <div
        className={cn(
          "mt-4 inline-flex items-center gap-1 text-xs font-medium",
          accent ? "text-signal" : "text-primary",
        )}
      >
        View <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

export function Hero() {
  const { data: jobs = [] } = useQuery({ queryKey: ["jobs"], queryFn: () => listJobs() });
  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => listDeals() });

  const job = jobs[0];
  const deal = deals[0];
  const event = events[0];
  const headline = sampleIssue.sections[0]?.items[0]?.title ?? sampleIssue.title;

  return (
    <section id="newsletter" className="relative overflow-hidden border-b border-rule">
      {/* Background image */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg.url})` }}
        aria-hidden="true"
      />
      {/* Subtle vignette for readability */}
      <div
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_rgba(245,158,11,0.08),_transparent_50%)]"
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 pt-20 pb-12 lg:pt-28 lg:pb-16">
        {/* Top split: headline + form */}
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="max-w-2xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-signal">
              Issue #{sampleIssue.number} · Thursdays · Free
            </p>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              The affiliate industry, every week.
            </h1>
            <p className="mt-6 max-w-lg text-lg text-muted-foreground sm:text-xl">
              News, new programmes, open jobs and the events worth attending — read, filtered and
              written up by an operator. One email, every Thursday morning.
            </p>
          </div>

          <div className="lg:justify-self-end">
            <div className="rounded-2xl border border-rule bg-white/90 p-6 shadow-card backdrop-blur-sm sm:p-8">
              <div className="flex items-center gap-2 text-signal">
                <Mail className="size-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Subscribe free</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                Join the weekly briefing. No spam, one-click unsubscribe.
              </p>
              <div className="mt-4">
                <NewsletterForm source="hero" buttonLabel="Join free" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom preview band */}
        <div className="mt-16 lg:mt-24">
          <div className="mb-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-rule" />
            <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              This week in the newsletter
            </span>
            <div className="h-px flex-1 bg-rule" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <PreviewCard
              label="Latest issue"
              icon={Mail}
              href={`/issues/${sampleIssue.slug}`}
              title={headline}
              meta={`Issue #${sampleIssue.number} · ${sampleIssue.readingTime}`}
              className="translate-y-2"
            />
            {job ? (
              <PreviewCard
                label="Active jobs"
                icon={Briefcase}
                href={`/jobs/${job.id}`}
                title={job.title}
                meta={`${job.company} · ${job.location}`}
                className="-translate-y-1"
              />
            ) : (
              <PreviewCard
                label="Active jobs"
                icon={Briefcase}
                href="/jobs"
                title="New affiliate roles"
                meta="Remote & on-site openings"
                className="-translate-y-1"
              />
            )}
            {event ? (
              <PreviewCard
                label="Events"
                icon={Calendar}
                href={`/events/${event.id}`}
                title={event.name}
                meta={`${event.date} · ${event.location}`}
                className="translate-y-3"
              />
            ) : (
              <PreviewCard
                label="Events"
                icon={Calendar}
                href="/events"
                title="Industry events"
                meta="Conferences, meetups & webinars"
                className="translate-y-3"
              />
            )}
            {deal ? (
              <PreviewCard
                label="Partner deals"
                icon={Tag}
                href={`/deals/${deal.id}`}
                title={deal.title}
                meta={`${deal.vendor}${deal.discountLabel ? ` · ${deal.discountLabel}` : ""}`}
                accent
                className="-translate-y-0.5"
              />
            ) : (
              <PreviewCard
                label="Partner deals"
                icon={Tag}
                href="/deals"
                title="Exclusive tools & discounts"
                meta="Software, proxies & trackers"
                accent
                className="-translate-y-0.5"
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
