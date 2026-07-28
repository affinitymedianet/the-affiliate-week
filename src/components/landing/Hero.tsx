import { Link } from "@tanstack/react-router";

import { NewsletterForm } from "@/components/NewsletterForm";
import { sampleIssue } from "@/data/issues";

export function Hero() {
  return (
    <section id="newsletter" className="bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-6 lg:px-8 py-14 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-20">
        <div className="max-w-xl">
          <p className="font-display text-xs font-bold uppercase tracking-[0.2em] text-primary-foreground">
            Issue #{sampleIssue.number} · Thursdays · Free
          </p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
            The affiliate industry, every week.
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-primary-foreground/85">
            One email every Thursday with the news, new programmes, open jobs, events and deals
            worth your time — read and written up by an operator.
          </p>
        </div>

        <div className="w-full lg:justify-self-end lg:max-w-md">
          <NewsletterForm
            source="hero"
            variant="band"
            layout="stacked"
            buttonLabel="Subscribe"
            hideNote
          />
          <p className="mt-3 text-sm text-primary-foreground/80">
            By subscribing, you accept our{" "}
            <Link to="/terms" className="underline underline-offset-2 hover:text-signal">
              Terms
            </Link>{" "}
            &{" "}
            <Link to="/privacy" className="underline underline-offset-2 hover:text-signal">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
