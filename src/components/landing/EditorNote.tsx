import { Link } from "@tanstack/react-router";

import { sampleIssue } from "@/data/issues";

export function EditorNote() {
  return (
    <section id="why" className="border-b border-rule py-16 lg:py-20">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 sm:px-6 lg:px-8 md:grid-cols-[auto_1fr] md:gap-12">
        <div className="flex size-14 items-center justify-center rounded-full bg-navy font-display text-xl font-bold text-navy-foreground">
          AW
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
            A note from the editor
          </h2>
          <div className="mt-4 space-y-4 text-base leading-relaxed text-muted-foreground">
            <p>
              The Affiliate Week is written by an operator, not a content team. Everything in an
              issue is read and filtered by a person before it goes in — if a week is quiet, the issue
              is short. We don't pad it with press releases.
            </p>
            <p>
              One email on Thursday morning, five minutes to read, one-click unsubscribe in every
              issue. Your email address is used for the newsletter and nothing else — never sold,
              never shared.
            </p>
          </div>
          <p className="mt-6 text-sm">
            <Link
              to="/issues/$slug"
              params={{ slug: sampleIssue.slug }}
              className="font-medium text-primary hover:underline"
            >
              Read a full sample issue before you subscribe →
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
