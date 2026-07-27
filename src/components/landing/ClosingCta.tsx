import { NewsletterForm } from "@/components/NewsletterForm";

export function ClosingCta() {
  return (
    <section className="bg-navy py-20 text-navy-foreground">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight sm:text-5xl">
          Join before issue #1
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-navy-foreground/75">
          One email every Thursday with the week's affiliate news, jobs, events and deals. Free,
          five minutes, unsubscribe in one click.
        </p>
        <div className="mx-auto mt-8 max-w-md">
          <NewsletterForm source="cta" variant="dark" buttonLabel="Get the newsletter" />
        </div>
      </div>
    </section>
  );
}
