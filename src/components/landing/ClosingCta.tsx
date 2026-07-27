import { NewsletterForm } from "@/components/NewsletterForm";

export function ClosingCta() {
  return (
    <section className="bg-navy py-16 text-navy-foreground lg:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          Ready to find better affiliate opportunities?
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-navy-foreground/75">
          One email every Thursday with the week's affiliate news, jobs, events and offers. Free,
          five minutes, unsubscribe in one click.
        </p>
        <div className="mx-auto mt-8 max-w-md">
          <NewsletterForm source="cta" variant="dark" buttonLabel="Get the newsletter" />
        </div>
      </div>
    </section>
  );
}
