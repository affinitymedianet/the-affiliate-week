import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { MapPin, CalendarDays, Ticket, ExternalLink } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { eventImage, type AffiliateEvent } from "@/data/events";
import { getEvent } from "@/lib/events.functions";

export const Route = createFileRoute("/events/$eventId")({
  head: ({ params, loaderData }) => {
    const event = loaderData as AffiliateEvent | undefined;
    const title = event
      ? `${event.name} — ${event.date}, ${event.location} | The Affiliate Week`
      : "Event not found — The Affiliate Week";
    const description =
      event?.description ??
      "This event could not be found. Browse the full affiliate events calendar.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: `/events/${params.eventId}` },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/events/${params.eventId}` }],
      scripts: event
        ? [
            {
              type: "application/ld+json",
              children: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Event",
                name: event.name,
                startDate: event.isoDate,
                description: event.description,
                eventAttendanceMode:
                  event.location === "Online"
                    ? "https://schema.org/OnlineEventAttendanceMode"
                    : "https://schema.org/OfflineEventAttendanceMode",
                location:
                  event.location === "Online"
                    ? { "@type": "VirtualLocation", name: "Online" }
                    : { "@type": "Place", name: event.location },
              }),
            },
          ]
        : [],
    };
  },
  loader: async ({ params }): Promise<AffiliateEvent> => {
    const event = await getEvent({ data: { slug: params.eventId } });
    if (!event) throw notFound();
    return event;
  },
  errorComponent: () => <EventMissing />,
  notFoundComponent: () => <EventMissing />,
  component: EventPage,
});

function EventMissing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">We couldn't find that event</h1>
        <Link to="/events" className="mt-6 inline-block font-medium text-primary hover:underline">
          Back to the events calendar
        </Link>
      </main>
      <SiteFooter />
    </div>
  );
}

function EventPage() {
  const event = Route.useLoaderData() as AffiliateEvent;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <article className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8 py-12 lg:py-16">
          <Link to="/events" className="text-sm font-medium text-primary hover:underline">
            ← All events
          </Link>
          <div className="mt-6 overflow-hidden rounded-xl border border-border shadow-card">
            <img
              src={eventImage(event)}
              alt={`${event.name} event`}
              width={1024}
              height={640}
              className="h-56 w-full object-cover sm:h-72"
            />
          </div>
          <div className="mt-6">
            <Breadcrumbs items={[{ label: "Events", href: "/events" }, { label: event.name }]} />
          </div>
          <span className="mt-4 block text-xs font-medium uppercase tracking-wide text-primary">
            {event.format}
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold sm:text-4xl">{event.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{event.description}</p>

          <dl className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-6 shadow-card sm:grid-cols-3">
            <div>
              <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="size-4" /> Date
              </dt>
              <dd className="mt-1 font-medium">{event.date}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                <MapPin className="size-4" /> Location
              </dt>
              <dd className="mt-1 font-medium">{event.location}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-muted-foreground">
                <Ticket className="size-4" /> Tickets
              </dt>
              <dd className="mt-1 font-medium">{event.price}</dd>
            </div>
          </dl>

          {event.url ? (
            <a
              href={event.url}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="mt-6 inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              Official event site <ExternalLink className="size-4" />
            </a>
          ) : (
            <p className="mt-6 text-sm text-muted-foreground">
              Organising this event?{" "}
              <Link to="/submit" className="font-medium text-primary hover:underline">
                Send us the official link
              </Link>{" "}
              and we'll add it.
            </p>
          )}

          <div className="mt-12 rounded-xl border border-border bg-background p-6 text-center">
            <h2 className="font-display text-xl font-semibold">
              Never miss an affiliate event again
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We list new events every Thursday in the newsletter.
            </p>
            <div className="mx-auto mt-5 max-w-md">
              <NewsletterForm source="footer" />
            </div>
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
