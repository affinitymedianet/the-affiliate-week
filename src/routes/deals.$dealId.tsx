import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { Tag, Sparkles, ExternalLink, CalendarClock, BadgePercent } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Button } from "@/components/ui/button";
import { getDeal } from "@/lib/deals.functions";

const dealQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["deals", id],
    queryFn: async () => {
      const deal = await getDeal({ data: { id } });
      if (!deal) throw notFound();
      return deal;
    },
  });

export const Route = createFileRoute("/deals/$dealId")({
  loader: async ({ context, params }) => {
    const deal = await context.queryClient.ensureQueryData(dealQueryOptions(params.dealId));
    return { deal };
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Deal unavailable — AffiliateX" }, { name: "robots", content: "noindex" }],
      };
    }
    const { deal } = loaderData;
    const title = `${deal.title} — ${deal.vendor} deal | AffiliateX`;
    return {
      meta: [
        { title },
        { name: "description", content: deal.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: deal.summary },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/deals/${params.dealId}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/deals/${params.dealId}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Offer",
            name: deal.title,
            description: deal.description,
            category: deal.category,
            seller: { "@type": "Organization", name: deal.vendor },
            ...(deal.expiresOn ? { availabilityEnds: deal.expiresOn } : {}),
            ...(deal.dealUrl ? { url: deal.dealUrl } : {}),
          }),
        },
      ],
    };
  },
  component: DealDetail,
  errorComponent: ({ error }) => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center" role="alert">
      <h1 className="font-display text-2xl font-bold">We couldn't load this deal</h1>
      <p className="mt-3 text-sm text-muted-foreground">{error.message}</p>
      <Link to="/deals" className="mt-6 inline-block text-sm font-medium text-primary underline">
        Back to all deals
      </Link>
    </div>
  ),
  notFoundComponent: () => (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-display text-2xl font-bold">This deal has ended</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        It may have expired or been pulled by the vendor.
      </p>
      <Link to="/deals" className="mt-6 inline-block text-sm font-medium text-primary underline">
        Browse current deals
      </Link>
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

function DealDetail() {
  const { dealId } = Route.useParams();
  const { data: deal } = useSuspenseQuery(dealQueryOptions(dealId));

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-surface py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-4">
            <Breadcrumbs items={[{ label: "Deals", href: "/deals" }, { label: deal.title }]} />
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {deal.category}
              </span>
              <span className="rounded-full border border-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {deal.dealType}
              </span>
              {deal.exclusive ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-0.5 text-xs font-medium text-navy-foreground">
                  <Sparkles className="size-3" /> Reader exclusive
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{deal.title}</h1>
            <p className="mt-3 text-muted-foreground">{deal.summary}</p>
            <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Tag className="size-4" />
                {deal.vendor}
              </span>
              {deal.discountLabel ? (
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <BadgePercent className="size-4" />
                  {deal.discountLabel}
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <CalendarClock className="size-4" />
                {deal.expiresOn ? `Ends ${formatDate(deal.expiresOn)}` : "No end date announced"}
              </span>
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-4">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card">
              <h2 className="font-display text-lg font-semibold">What you get</h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {deal.description}
              </p>

              {deal.couponCode ? (
                <div className="mt-6 rounded-lg border border-dashed border-primary/50 bg-primary/5 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-primary">
                    Coupon code
                  </p>
                  <p className="mt-1 font-display text-xl font-bold tracking-wider">
                    {deal.couponCode}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Apply at checkout on the vendor's site.
                  </p>
                </div>
              ) : null}

              <div className="mt-6">
                {deal.dealUrl ? (
                  <Button asChild size="lg">
                    <a href={deal.dealUrl} target="_blank" rel="nofollow sponsored noopener">
                      Claim this deal <ExternalLink className="size-4" />
                    </a>
                  </Button>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This deal has no live link right now.
                  </p>
                )}
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Some links are affiliate links. It never changes what you pay, and we only list
                tools we would use ourselves.
              </p>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <Link to="/deals" className="font-medium text-primary hover:underline">
                ← All deals
              </Link>
              <Link to="/submit" className="font-medium text-primary hover:underline">
                Submit a deal →
              </Link>
            </div>

            <div className="mt-10 rounded-xl border border-border bg-surface p-6 text-center">
              <h2 className="font-display text-xl font-semibold">Get deals before they expire</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Exclusive codes land in the Thursday issue first.
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
