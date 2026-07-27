import { NewsletterForm } from "@/components/NewsletterForm";

export function Hero() {
  return (
    <section id="newsletter" className="border-b border-rule bg-surface">
      <div className="mx-auto max-w-4xl px-4 py-20 text-center lg:py-28">
        <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-signal">
          Issue #1 · Thursdays · Free
        </p>
        <h1 className="mx-auto mt-6 max-w-3xl font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
          The affiliate week in five minutes
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
          News, new programmes, open jobs and the events worth attending — read, filtered and
          written up by an operator. One email, every Thursday morning.
        </p>

        <div className="mx-auto mt-9 max-w-md">
          <NewsletterForm source="hero" buttonLabel="Subscribe free" />
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          Free forever · One-click unsubscribe · No spam, ever
        </p>
      </div>
    </section>
  );
}
