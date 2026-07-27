import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { NewsletterForm } from "@/components/NewsletterForm";
import { issues } from "@/data/issues";

const title = "AffiliateX newsletter archive — read past issues";
const description =
  "Read AffiliateX issues in full before you subscribe: affiliate industry news, new programmes, jobs and events, published every Thursday.";

export const Route = createFileRoute("/archive")({
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
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-surface py-14 lg:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <h1 className="font-display text-4xl font-bold sm:text-5xl">Newsletter archive</h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Every issue is published here in full, free to read. Start with the sample issue to
              see the format, length and tone before you hand over your email address.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-4xl px-4">
            <ul className="space-y-4">
              {issues.map((issue) => (
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

            <div className="mt-12 rounded-xl border border-border bg-surface p-6 text-center">
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
