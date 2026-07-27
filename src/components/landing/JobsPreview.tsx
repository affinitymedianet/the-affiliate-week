import { Link } from "@tanstack/react-router";
import { MapPin, Building2, Briefcase, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { listJobs } from "@/lib/jobs.functions";

export function JobsPreview() {
  const { data: jobs } = useQuery({ queryKey: ["jobs"], queryFn: () => listJobs() });
  const latest = (jobs ?? []).slice(0, 3);

  if (latest.length === 0) return null;

  return (
    <section className="border-b border-border py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Latest affiliate jobs</h2>
          <p className="mt-3 text-muted-foreground">
            Open roles in affiliate management, partnerships and performance marketing.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {latest.map((job) => (
            <article
              key={job.id}
              className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-lift"
            >
              <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {job.workType}
              </span>
              <h3 className="mt-3 font-display text-lg font-semibold">
                <Link to="/jobs/$jobId" params={{ jobId: job.id }} className="hover:underline">
                  {job.title}
                </Link>
              </h3>
              <p className="mt-2 flex-1 text-sm text-muted-foreground">{job.summary}</p>
              <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
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
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline">
            <Link to="/jobs">
              See all jobs <ArrowRight className="ml-1.5 size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
