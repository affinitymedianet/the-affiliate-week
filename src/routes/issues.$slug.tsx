import { createFileRoute, Link, notFound } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { issues, type Issue } from "@/data/issues";

export const Route = createFileRoute("/issues/$slug")({
  head: ({ params }) => {
    const issue = issues.find((i) => i.slug === params.slug);
    const title = issue
      ? `${issue.title} — AffiliateX`
      : "Issue not found — AffiliateX newsletter";
    const description =
      issue?.summary ??
      "This AffiliateX issue could not be found. Browse the archive for every published issue.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/issues/${params.slug}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/issues/${params.slug}` }],
      scripts: issue
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: issue.title,
                datePublished: issue.isoDate,
                description: issue.summary,
                author: { "@type": "Organization", name: "AffiliateX" },
              }),
            },
          ]
        : [],
    };
  },
  loader: ({ params }): Issue => {
    const issue = issues.find((i) => i.slug === params.slug);
    if (!issue) throw notFound();
    return issue;
  },
  errorComponent: () => <IssueMissing />,
  notFoundComponent: () => <IssueMissing />,
  component: IssuePage,
});

function IssueMissing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">We couldn't find that issue</h1>
        <p className="mt-3 text-muted-foreground">
          It may have moved. Every published issue is listed in the archive.
        </p>
        <Link to="/archive" className="mt-6 inline-block font-medium text-primary hover:underline">
          Back to the archive
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function IssuePage() {
  const issue = Route.useLoaderData() as Issue;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <article className="mx-auto max-w-3xl px-4 py-14 lg:py-20">
          <Breadcrumbs
            items={[{ label: "Archive", href: "/archive" }, { label: `Issue #${issue.number}` }]}
          />
          <p className="mt-5 text-xs font-medium uppercase tracking-wide text-primary">
            Issue #{issue.number} · {issue.date} · {issue.readingTime}
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{issue.title}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{issue.summary}</p>

          <div className="mt-10 space-y-10">
            {issue.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="font-display text-xl font-semibold">{section.heading}</h2>
                <div className="mt-4 space-y-5 border-l-2 border-border pl-5">
                  {section.items.map((item) => (
                    <div key={item.title}>
                      <h3 className="font-medium">{item.title}</h3>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                        {item.body}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <div className="mt-14 rounded-xl border border-border bg-surface p-6 text-center">
            <h2 className="font-display text-xl font-semibold">Want this every Thursday?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Free, five minutes, one-click unsubscribe.
            </p>
            <div className="mx-auto mt-5 max-w-md">
              <NewsletterForm source="footer" />
            </div>
          </div>

          <p className="mt-8 text-center text-sm">
            <Link to="/archive" className="font-medium text-primary hover:underline">
              See all issues
            </Link>
          </p>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
