import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MapPin, CalendarDays, Ticket, ArrowRight } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Button } from "@/components/ui/button";
import { events } from "@/data/events";

const title = "Affiliate marketing events calendar — AffiliateX";
const description =
  "Every affiliate marketing conference, meetup and webinar we're tracking, with dates, locations and ticket prices. Updated weekly.";

export const Route = createFileRoute("/events/")({
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

function EventsPage() {
  const [format, setFormat] = useState<(typeof formats)[number]>("All");
  const [place, setPlace] = useState<(typeof places)[number]>("All");
  const [freeOnly, setFreeOnly] = useState(false);

  const filtered = useMemo(
    () =>
      events.filter((e) => {
        if (format !== "All" && e.format !== format) return false;
        if (place === "Online" && e.location !== "Online") return false;
        if (place === "In person" && e.location === "Online") return false;
        if (freeOnly && e.price.toLowerCase() !== "free") return false;
        return true;
      }),
    [format, place, freeOnly],
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-surface py-14 lg:py-20">
          <div className="mx-auto max-w-6xl px-4">
            <h1 className="font-display text-4xl font-bold sm:text-5xl">
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
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-4xl px-4">
            <div className="flex flex-wrap items-center gap-2">
              {formats.map((f) => (
                <Button
                  key={f}
                  type="button"
                  size="sm"
                  variant={format === f ? "default" : "outline"}
                  onClick={() => setFormat(f)}
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
                  onClick={() => setPlace(p)}
                >
                  {p}
                </Button>
              ))}
              <Button
                type="button"
                size="sm"
                variant={freeOnly ? "secondary" : "ghost"}
                onClick={() => setFreeOnly((v) => !v)}
              >
                Free only
              </Button>
            </div>

            <p className="mt-4 text-sm text-muted-foreground">
              Showing {filtered.length} of {events.length} events
            </p>

            <ul className="mt-4 divide-y divide-border rounded-xl border border-border bg-card shadow-card">
              {filtered.map((event) => (
                <li
                  key={event.id}
                  className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6"
                >
                  <img
                    src={event.image}
                    alt={`${event.name} event`}
                    loading="lazy"
                    width={1024}
                    height={640}
                    className="h-28 w-full rounded-lg object-cover sm:h-20 sm:w-32"
                  />
                  <div className="flex-1">
                    <span className="text-xs font-medium uppercase tracking-wide text-primary">
                      {event.format}
                    </span>
                    <h2 className="mt-1 font-display text-lg font-semibold">
                      <Link
                        to="/events/$eventId"
                        params={{ eventId: event.id }}
                        className="hover:underline"
                      >
                        {event.name}
                      </Link>
                    </h2>
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
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                  >
                    Details <ArrowRight className="size-4" />
                  </Link>
                </li>
              ))}
            </ul>

            {filtered.length === 0 ? (
              <p className="mt-6 text-center text-sm text-muted-foreground">
                No events match those filters yet.
              </p>
            ) : null}

            <div className="mt-12 rounded-xl border border-border bg-surface p-6 text-center">
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
