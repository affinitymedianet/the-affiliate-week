import { NewsletterForm } from "@/components/NewsletterForm";

export function ClosingCta() {
  return (
    <section className="relative overflow-hidden bg-navy text-navy-foreground">
      {/* colour wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            "radial-gradient(60% 90% at 15% 0%, color-mix(in oklab, var(--primary) 55%, transparent) 0%, transparent 60%), radial-gradient(50% 80% at 90% 100%, color-mix(in oklab, var(--signal) 40%, transparent) 0%, transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-signal/60"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-20 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full border border-signal/50 bg-signal/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-signal">
            <span className="size-1.5 rounded-full bg-signal" />
            Issue #1 lands Thursday
          </span>
          <h2 className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-5xl">
            Join before issue&nbsp;#1
          </h2>
          <p className="mt-4 max-w-xl text-navy-foreground/80">
            One email every Thursday with the week's affiliate news, jobs, events and deals. Free,
            five minutes, unsubscribe in one click.
          </p>
          <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-navy-foreground/70">
            <li>✓ No spam, ever</li>
            <li>✓ One click to leave</li>
            <li>✓ Curated by hand</li>
          </ul>
        </div>

        <div className="rounded-xl border border-navy-foreground/15 bg-navy-deep/50 p-6 backdrop-blur-sm">
          <p className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-signal">
            Subscribe free
          </p>
          <div className="mt-4">
            <NewsletterForm source="cta" variant="dark" buttonLabel="Get the newsletter" />
          </div>
        </div>
      </div>
    </section>
  );
}
