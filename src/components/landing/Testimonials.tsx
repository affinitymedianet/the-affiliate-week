import { Star } from "lucide-react";

const testimonials = [
  {
    quote:
      "The only affiliate newsletter I actually open. I found two networks and one hire through it in a single quarter.",
    name: "Jade Ortiz",
    role: "Affiliate Manager, Cove Commerce",
    initials: "JO",
  },
  {
    quote:
      "It saves me the hour a week I used to spend crawling forums and Slack groups for programme changes.",
    name: "Marcus Kelly",
    role: "Media Buyer, independent",
    initials: "MK",
  },
  {
    quote:
      "The events section alone is worth it. I plan my whole conference calendar from those listings.",
    name: "Sofia Reyes",
    role: "Head of Partnerships, Loop",
    initials: "SR",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="border-b border-border bg-surface py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            What our readers are saying
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {testimonials.map((t) => (
            <figure
              key={t.name}
              className="flex flex-col rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-foreground">
                "{t.quote}"
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-full bg-navy text-xs font-semibold text-navy-foreground">
                  {t.initials}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{t.name}</span>
                  <span className="block text-xs text-muted-foreground">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
