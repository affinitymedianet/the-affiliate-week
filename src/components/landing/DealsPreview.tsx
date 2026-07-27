import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles, Tag } from "lucide-react";

import { listDeals } from "@/lib/deals.functions";

export function DealsPreview() {
  const { data: deals = [] } = useQuery({ queryKey: ["deals"], queryFn: () => listDeals() });
  const top = deals.slice(0, 3);

  return (
    <section id="deals" className="border-t border-border bg-surface py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary">Deals</p>
            <h2 className="mt-2 font-display text-3xl font-bold sm:text-4xl">
              Exclusive software, tool and proxy deals
            </h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Discounts on trackers, proxies, SEO tools and hosting — negotiated or verified before
              we publish them.
            </p>
          </div>
          <Link
            to="/deals"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            All deals <ArrowRight className="size-4" />
          </Link>
        </div>

        {top.length ? (
          <ul className="mt-8 grid gap-4 md:grid-cols-3">
            {top.map((deal) => (
              <li
                key={deal.id}
                className="flex flex-col rounded-xl border border-border bg-card p-5 shadow-card transition-shadow hover:shadow-lift"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {deal.category}
                  </span>
                  {deal.exclusive ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-navy px-2.5 py-0.5 text-xs font-medium text-navy-foreground">
                      <Sparkles className="size-3" /> Exclusive
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-3 font-display text-lg font-semibold">
                  <Link to="/deals/$dealId" params={{ dealId: deal.id }} className="hover:underline">
                    {deal.title}
                  </Link>
                </h3>
                <p className="mt-1 flex-1 text-sm text-muted-foreground">{deal.summary}</p>
                <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Tag className="size-4" />
                  {deal.vendor}
                  {deal.discountLabel ? (
                    <span className="ml-auto font-medium text-foreground">
                      {deal.discountLabel}
                    </span>
                  ) : null}
                </p>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
