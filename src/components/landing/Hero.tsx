import heroPreview from "@/assets/hero-dashboard.jpg";
import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { NewsletterForm } from "@/components/NewsletterForm";

export function Hero() {
  return (
    <section id="newsletter" className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-[1.05fr_1fr] lg:py-24">
        <div>
          <span className="inline-flex items-center rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            Weekly · Every Thursday · Free
          </span>
          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            Your complete affiliate marketing{" "}
            <span className="text-primary">resource hub</span>
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            AffiliateX is a weekly newsletter for affiliate marketers. Industry news, new
            programmes and offers, affiliate jobs and the events worth attending — filtered down
            to one email you can read in five minutes.
          </p>

          <div className="mt-7 max-w-md">
            <NewsletterForm source="hero" buttonLabel="Subscribe free" />
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <Link
              to="/issues/$slug"
              params={{ slug: "sample-issue" }}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              Read a sample issue first <ArrowRight className="size-4" />
            </Link>
            <p className="text-sm text-muted-foreground">
              Issue #1 ships soon — be one of the first readers.
            </p>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lift">
            <div className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
              <span className="font-display text-sm font-semibold">AffiliateX · Issue #1</span>
              <span className="text-xs text-muted-foreground">Thursday, 7:00am</span>
            </div>
            <img
              src={heroPreview}
              alt="Preview of the AffiliateX weekly newsletter issue"
              width={1280}
              height={960}
              loading="eager"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="absolute -bottom-4 left-4 rounded-lg border border-border bg-background px-4 py-3 shadow-card">
            <p className="font-display text-xl font-bold">5 min read</p>
            <p className="text-xs text-muted-foreground">News · Offers · Jobs · Events</p>
          </div>
        </div>
      </div>
    </section>
  );
}
