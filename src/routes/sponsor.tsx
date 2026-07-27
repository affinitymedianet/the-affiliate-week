import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const title = "Sponsor AffiliateX — reach affiliate marketers weekly";
const description =
  "Advertise to affiliates, media buyers and partnership managers in the AffiliateX weekly newsletter. Placements, audience profile and how to book.";

export const Route = createFileRoute("/sponsor")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/sponsor" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/sponsor" }],
  }),
  component: SponsorPage,
});

const schema = z.object({
  name: z.string().trim().min(1, "Add your name").max(120),
  company: z.string().trim().min(1, "Add your company").max(200),
  email: z.string().trim().email("Enter a valid email").max(255),
  website: z.string().trim().max(500).optional(),
  budget: z.string().trim().max(100).optional(),
  message: z.string().trim().max(2000).optional(),
});

const placements = [
  {
    name: "Primary sponsor",
    detail:
      "Top-of-issue placement under the intro: 60 words, a logo and one link. One per issue.",
  },
  {
    name: "Classified",
    detail: "A single line in the jobs, offers or events section. Up to three per issue.",
  },
  {
    name: "Programme spotlight",
    detail:
      "A short written breakdown of your affiliate programme — terms, payouts, who it suits. Clearly marked as sponsored.",
  },
];

function SponsorPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      name: form.get("name"),
      company: form.get("company"),
      email: form.get("email"),
      website: form.get("website"),
      budget: form.get("budget"),
      message: form.get("message"),
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setStatus("loading");
    setError(null);
    const { error: insertError } = await supabase.from("sponsor_enquiries").insert(parsed.data);
    if (insertError) {
      setStatus("idle");
      setError("Something went wrong. Please email partners@affiliatex.co instead.");
      return;
    }
    setStatus("done");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-surface py-14 lg:py-20">
          <div className="mx-auto max-w-4xl px-4">
            <h1 className="font-display text-4xl font-bold sm:text-5xl">
              Sponsor the newsletter
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              AffiliateX goes to people who buy media, run programmes and choose networks — a
              small, specific audience rather than a large general one.
            </p>
          </div>
        </section>

        <section className="border-b border-border py-12 lg:py-16">
          <div className="mx-auto max-w-4xl px-4">
            <h2 className="font-display text-2xl font-semibold">Who reads it</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Affiliates and publishers, affiliate and partnership managers, media buyers, and
              network teams. We publish live subscriber and open-rate figures here once the list
              has a meaningful run of issues behind it — we won't quote numbers we can't back up.
            </p>

            <h2 className="mt-12 font-display text-2xl font-semibold">Placements</h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {placements.map((p) => (
                <article
                  key={p.name}
                  className="rounded-xl border border-border bg-card p-6 shadow-card"
                >
                  <h3 className="font-display text-lg font-semibold">{p.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.detail}</p>
                </article>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              Every paid placement is labelled. We don't take link insertions into editorial
              copy, and we don't sell the subscriber list.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-4">
            <h2 className="font-display text-2xl font-semibold">Request the rate card</h2>
            {status === "done" ? (
              <div className="mt-6 rounded-xl border border-border bg-card p-8 text-center shadow-card">
                <h3 className="font-display text-lg font-semibold">Thanks — we'll be in touch</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  You'll get current rates, available slots and audience figures by email.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-6 rounded-xl border border-border bg-card p-6 shadow-card sm:p-8"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="name">Your name</Label>
                    <Input id="name" name="name" maxLength={120} required className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      maxLength={200}
                      required
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Work email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      maxLength={255}
                      required
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      maxLength={500}
                      placeholder="https://"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="budget">Rough budget</Label>
                    <Input
                      id="budget"
                      name="budget"
                      maxLength={100}
                      placeholder="Optional — helps us suggest a placement"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="message">What are you promoting?</Label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={5}
                      maxLength={2000}
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                <Button type="submit" size="lg" disabled={status === "loading"}>
                  {status === "loading" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Request rates"
                  )}
                </Button>
              </form>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
