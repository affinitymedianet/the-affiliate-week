import { Link } from "@tanstack/react-router";
import { MapPin, ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { events } from "@/data/events";

export function EventsPreview() {
  const featured = events.slice(0, 3);

  return (
    <section className="border-b border-border bg-surface py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Featured events for marketers
          </h2>
          <p className="mt-3 text-muted-foreground">
            The next conferences, meetups and webinars covered in the newsletter.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {featured.map((event) => (
            <article
              key={event.id}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-lift"
            >
              <div className="relative">
                <img
                  src={event.image}
                  alt={`${event.name} event`}
                  loading="lazy"
                  width={1024}
                  height={640}
                  className="h-44 w-full object-cover"
                />
                <span className="absolute left-4 top-4 flex flex-col items-center rounded-md bg-background px-3 py-1.5 text-center shadow-card">
                  <span className="font-display text-lg font-bold leading-none">
                    {event.dateLabel.day}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {event.dateLabel.month}
                  </span>
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <span className="text-xs font-medium uppercase tracking-wide text-primary">
                  {event.format}
                </span>
                <h3 className="mt-2 font-display text-lg font-semibold">
                  <Link
                    to="/events/$eventId"
                    params={{ eventId: event.id }}
                    className="hover:underline"
                  >
                    {event.name}
                  </Link>
                </h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{event.description}</p>
                <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="size-4" />
                  {event.location}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/events">
              See all events <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
