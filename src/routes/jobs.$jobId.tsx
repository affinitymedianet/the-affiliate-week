import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { MapPin, Building2, Briefcase, Banknote, ExternalLink, ArrowLeft } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { getJob } from "@/lib/jobs.functions";

const jobQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["jobs", id],
    queryFn: async () => {
      const job = await getJob({ data: { id } });
      if (!job) throw notFound();
      return job;
    },
  });

export const Route = createFileRoute("/jobs/$jobId")({
  loader: async ({ context, params }) => {
    const job = await context.queryClient.ensureQueryData(jobQueryOptions(params.jobId));
    return { job };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Job unavailable — AffiliateX" }, { name: "robots", content: "noindex" }],
      };
    }
    const { job } = loaderData;
    const title = `${job.title} at ${job.company} — ${job.location} | AffiliateX`;
    return {
      meta: [
        { title },
        { name: "description", content: job.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: job.summary },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/jobs/${params.jobId}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/jobs/${params.jobId}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "JobPosting",
            title: job.title,
            description: job.description,
            datePosted: job.postedOn,
            ...(job.expiresOn ? { validThrough: job.expiresOn } : {}),
            employmentType: job.employmentType.toUpperCase().replace("-", "_"),
            hiringOrganization: { "@type": "Organization", name: job.company },
            jobLocationType: job.workType === "Remote" ? "TELECOMMUTE" : undefined,
            jobLocation: {
              "@type": "Place",
              address: { "@type": "PostalAddress", addressLocality: job.location },
            },
            ...(job.applyUrl ? { url: job.applyUrl } : {}),
          }),
        },
      ],
    };
  },
  component: JobDetail,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center" role="alert">
      <h1 className="font-display text-2xl font-bold">We couldn't load this role</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
    </div>
  ),
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">This role is no longer listed</h1>
        <p className="mt-3 text-muted-foreground">
          It may have been filled or withdrawn. Browse the roles that are still open.
        </p>
        <Button asChild className="mt-6">
          <Link to="/jobs">All affiliate jobs</Link>
        </Button>
      </main>
      <SiteFooter />
    </div>
  ),
});

function formatDate(date: string) {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

function JobDetail() {
  const { jobId } = Route.useParams();
  const { data: job } = useSuspenseQuery(jobQueryOptions(jobId));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-surface py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-4">
            <Breadcrumbs items={[{ label: "Jobs", href: "/jobs" }, { label: job.title }]} />
            <Link
              to="/jobs"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="size-4" /> All jobs
            </Link>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {job.workType}
              </span>
              {job.featured ? (
                <span className="rounded-full bg-navy px-2.5 py-0.5 text-xs font-medium text-navy-foreground">
                  Featured
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{job.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
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
            <p className="mt-3 text-xs text-muted-foreground">
              Posted {formatDate(job.postedOn)}
              {job.expiresOn ? ` · Closes ${formatDate(job.expiresOn)}` : ""}
            </p>

            {job.applyUrl ? (
              <Button asChild size="lg" className="mt-6">
                <a href={job.applyUrl} target="_blank" rel="noopener noreferrer nofollow">
                  Apply on company site <ExternalLink className="ml-1.5 size-4" />
                </a>
              </Button>
            ) : (
              <p className="mt-6 text-sm text-muted-foreground">
                No application link provided — details are in the listing below.
              </p>
            )}
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-4">
            <p className="text-lg text-muted-foreground">{job.summary}</p>
            <div className="mt-6 whitespace-pre-line leading-relaxed text-foreground">
              {job.description}
            </div>

            {job.applyUrl ? (
              <div className="mt-10 rounded-xl border border-border bg-card p-6 shadow-card">
                <h2 className="font-display text-lg font-semibold">Ready to apply?</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Applications are handled by {job.company} on their own site.
                </p>
                <Button asChild className="mt-4">
                  <a href={job.applyUrl} target="_blank" rel="noopener noreferrer nofollow">
                    Apply for this role <ExternalLink className="ml-1.5 size-4" />
                  </a>
                </Button>
              </div>
            ) : null}

            <div className="mt-12 rounded-xl border border-border bg-surface p-6 text-center">
              <h2 className="font-display text-xl font-semibold">
                Get new affiliate roles every Thursday
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Jobs, events and industry news in one five-minute email.
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
