import { Newspaper, Briefcase, CalendarDays, Tag, Users, LineChart } from "lucide-react";

const items = [
  {
    icon: Newspaper,
    title: "Industry news",
    body: "Network changes, tracking and compliance updates, and the moves that affect your payouts.",
  },
  {
    icon: Tag,
    title: "New offers & programmes",
    body: "Fresh affiliate programmes and commission changes worth adding to your rotation.",
  },
  {
    icon: Briefcase,
    title: "Affiliate jobs",
    body: "Openings for affiliate managers, media buyers and partnership leads, remote and on-site.",
  },
  {
    icon: CalendarDays,
    title: "Events",
    body: "Conferences, meetups and webinars — with dates, locations and whether they're worth the flight.",
  },
  {
    icon: Users,
    title: "Networking",
    body: "Who's hiring, who's launching, and where the people in this industry are gathering next.",
  },
  {
    icon: LineChart,
    title: "Tactics that worked",
    body: "Short breakdowns from operators on what is actually converting this month.",
  },
];

export function WhatsInside() {
  return (
    <section id="inside" className="border-b border-border py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">What's inside every issue</h2>
          <p className="mt-3 text-muted-foreground">
            Six sections, one email, five minutes. No filler, no recycled press releases.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article
              key={item.title}
              className="rounded-xl border border-border bg-card p-6 shadow-card transition-shadow hover:shadow-lift"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <item.icon className="size-5" />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
