import { useMemo } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MapPin, CalendarDays, Ticket, ArrowRight } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { Pager, paginate } from "@/components/site/Pager";
import { Button } from "@/components/ui/button";
import { events, type AffiliateEvent } from "@/data/events";

const title = "Affiliate marketing events calendar — The Affiliate Week";
const description =
  "Every affiliate marketing conference, meetup and webinar we're tracking, with dates, locations and ticket prices. Updated weekly.";

type EventsSearch = { q: string; format: string; place: string; free: boolean; page: number };

export const Route = createFileRoute("/events/")({
  validateSearch: (search: Record<string, unknown>): EventsSearch => ({
    q: typeof search.q === "string" ? search.q : "",
    format: typeof search.format === "string" ? search.format : "All",
    place: typeof search.place === "string" ? search.place : "All",
    free: search.free === true || search.free === "true",
    page: Number(search.page) > 0 ? Math.floor(Number(search.page)) : 1,
  }),
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/events" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/events" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Affiliate marketing events",
          itemListElement: events.map((e, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: e.name,
          })),
        }),
      },
    ],
  }),
  component: EventsPage,
});

const formats = ["All", "Conference", "Meetup", "Webinar", "Summit"] as const;
const places = ["All", "Online", "In person"] as const;

function groupByMonth(items: AffiliateEvent[]) {
  const groups: { label: string; events: AffiliateEvent[] }[] = [];
  for (const event of items) {
    const label = new Date(event.isoDate).toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric",
    });
    const last = groups[groups.length - 1];
    if (last && last.label === label) last.events.push(event);
    else groups.push({ label, events: [event] });
  }
  return groups;
}


function EventsPage() {
  const { q, format, place, free: freeOnly, page } = Route.useSearch();
  const navigate = useNavigate({ from: "/events" });
  const setSearch = (next: Partial<EventsSearch>) =>
    navigate({ search: (prev: EventsSearch) => ({ ...prev, page: 1, ...next }) });

  const filtered = useMemo(
    () =>
      events.filter((e) => {
        if (format !== "All" && e.format !== format) return false;
        if (place === "Online" && e.location !== "Online") return false;
        if (place === "In person" && e.location === "Online") return false;
        if (freeOnly && e.price.toLowerCase() !== "free") return false;
        if (q.trim()) {
          const needle = q.trim().toLowerCase();
          const haystack = `${e.name} ${e.location} ${e.format} ${e.description}`.toLowerCase();
          if (!haystack.includes(needle)) return false;
        }
        return true;
      }),
    [format, place, freeOnly, q],
  );

  const paged = paginate(filtered, page);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-background py-14 lg:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: "Events" }]} />
            <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
              Affiliate events calendar
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Every conference, meetup and webinar worth knowing about, in one list. We update it
              each week and cover the highlights in the newsletter.
            </p>
            <p className="mt-4 text-sm">
              <Link to="/submit" className="font-medium text-primary hover:underline">
                Submit an event →
              </Link>
              <Link to="/jobs" className="ml-6 font-medium text-primary hover:underline">
                Browse jobs →
              </Link>
              <Link to="/deals" className="ml-6 font-medium text-primary hover:underline">
                See deals →
              </Link>
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center gap-2">
              {formats.map((f) => (
                <Button
                  key={f}
                  type="button"
                  size="sm"
                  variant={format === f ? "default" : "outline"}
                  onClick={() => setSearch({ format: f })}
                >
                  {f}
                </Button>
              ))}
              <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
              {places.map((p) => (
                <Button
                  key={p}
                  type="button"
                  size="sm"
                  variant={place === p ? "secondary" : "ghost"}
                  onClick={() => setSearch({ place: p })}
                >
                  {p}
                </Button>
              ))}
              <Button
                type="button"
                size="sm"
                variant={freeOnly ? "secondary" : "ghost"}
                onClick={() => setSearch({ free: !freeOnly })}
              >
                Free only
              </Button>
            </div>

            <label className="mt-4 block">
              <span className="sr-only">Search events by name, location or format</span>
              <input
                type="search"
                value={q}
                onChange={(e) => setSearch({ q: e.target.value })}
                placeholder="Search events by name, location or format"
                className="w-full rounded-lg border border-border bg-card px-4 py-2.5 text-sm outline-none ring-primary/30 focus:ring-2"
              />
            </label>

            <p className="mt-4 text-sm text-muted-foreground">
              Showing {paged.items.length ? paged.start + 1 : 0}–{paged.end} of {filtered.length}{" "}
              events
            </p>

            <div className="mt-4 space-y-10">
              {groupByMonth(paged.items).map((group) => (
                <div key={group.label}>
                  <h2 className="border-b border-rule pb-2 font-display text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
                    {group.label}
                  </h2>
                  <ul className="divide-y divide-rule">
                    {group.events.map((event) => (
                      <li key={event.id} className="flex gap-5 py-6">
                        <div className="w-12 shrink-0 text-center">
                          <p className="font-display text-2xl font-bold leading-none">
                            {event.dateLabel.day}
                          </p>
                          <p className="mt-1 text-xs font-semibold uppercase text-signal">
                            {event.dateLabel.month}
                          </p>
                        </div>
                        <div className="flex-1">
                          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            {event.format}
                          </span>
                          <h3 className="mt-1 font-display text-lg font-semibold">
                            <Link
                              to="/events/$eventId"
                              params={{ eventId: event.id }}
                              className="hover:underline"
                            >
                              {event.name}
                            </Link>
                          </h3>
                          <p className="mt-1 text-sm text-muted-foreground">{event.description}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                              <CalendarDays className="size-4" />
                              {event.date}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <MapPin className="size-4" />
                              {event.location}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <Ticket className="size-4" />
                              {event.price}
                            </span>
                          </div>
                        </div>
                        <Link
                          to="/events/$eventId"
                          params={{ eventId: event.id }}
                          className="hidden shrink-0 items-center gap-1.5 self-start text-sm font-medium text-primary hover:underline sm:inline-flex"
                        >
                          Details <ArrowRight className="size-4" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>


            {filtered.length === 0 ? (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                No events match those filters yet.
              </p>
            ) : null}

            <Pager
              page={paged.page}
              totalPages={paged.totalPages}
              onPageChange={(p) =>
                navigate({ search: (prev: EventsSearch) => ({ ...prev, page: p }) })
              }
              label="Events pagination"
            />

            <div className="mt-12 rounded-xl border border-border bg-background p-6 text-center">
              <h2 className="font-display text-xl font-semibold">
                Get new events in your inbox weekly
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                We add fresh listings every week and send the best of them on Thursday.
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
