const items = [
  {
    n: "01",
    title: "Industry news",
    body: "Network changes, tracking and compliance updates, and the moves that affect your payouts.",
  },
  {
    n: "02",
    title: "New offers & programmes",
    body: "Fresh affiliate programmes and commission changes worth adding to your rotation.",
  },
  {
    n: "03",
    title: "Affiliate jobs",
    body: "Openings for affiliate managers, media buyers and partnership leads, remote and on-site.",
  },
  {
    n: "04",
    title: "Events",
    body: "Conferences, meetups and webinars — with dates, locations and whether they're worth the flight.",
  },
  {
    n: "05",
    title: "Networking",
    body: "Who's hiring, who's launching, and where the people in this industry are gathering next.",
  },
  {
    n: "06",
    title: "Tactics that worked",
    body: "Short breakdowns from operators on what is actually converting this month.",
  },
];

export function WhatsInside() {
  return (
    <section id="inside" className="border-b border-rule py-16 lg:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="border-b border-rule pb-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">
            Every issue
          </p>
          <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            Six sections, one email, five minutes
          </h2>
        </div>

        <div className="grid gap-x-12 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <article key={item.title} className="border-b border-rule py-6">
              <p className="font-display text-sm font-bold text-signal">{item.n}</p>
              <h3 className="mt-2 font-display text-lg font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
