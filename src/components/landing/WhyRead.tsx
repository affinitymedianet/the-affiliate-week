import { PenLine, Filter, Clock, Mail } from "lucide-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

const reasons = [
  {
    icon: Filter,
    title: "Curated, not aggregated",
    body: "Everything is read and filtered by a person before it goes in. If a week is quiet, the issue is short — we don't pad it with press releases.",
  },
  {
    icon: Clock,
    title: "Five minutes, once a week",
    body: "One email on Thursday morning. No daily blasts, no drip sequences, no 'quick question' follow-ups.",
  },
  {
    icon: PenLine,
    title: "Written by an operator",
    body: "AffiliateX is written by someone who has run affiliate programmes and content sites, not by a content team paraphrasing other newsletters.",
  },
  {
    icon: Mail,
    title: "Easy in, easy out",
    body: "One-click unsubscribe in every issue. Your email is used for the newsletter and nothing else — never sold or shared.",
  },
];

export function WhyRead() {
  return (
    <section id="why" className="border-b border-border bg-surface py-16 lg:py-24">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Why read AffiliateX</h2>
          <p className="mt-3 text-muted-foreground">
            We're at the start — issue #1 ships soon. Here's what we're committing to, and you can
            read a full sample issue before you decide.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {reasons.map((r) => (
            <article
              key={r.title}
              className="flex gap-4 rounded-xl border border-border bg-card p-6 shadow-card"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <r.icon className="size-5" />
              </span>
              <div>
                <h3 className="font-display text-lg font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.body}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Button asChild variant="outline" size="lg">
            <Link to="/issues/$slug" params={{ slug: "sample-issue" }}>
              Read a sample issue
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
