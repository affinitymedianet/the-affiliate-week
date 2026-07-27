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

const title = "Submit an affiliate event, job or offer — AffiliateX";
const description =
  "Tell us about an affiliate marketing event, job opening or new programme and we'll consider it for an upcoming issue of AffiliateX. Free editorial listings.";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/submit" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/submit" }],
  }),
  component: SubmitPage,
});

const schema = z.object({
  kind: z.enum(["event", "job", "offer"]),
  title: z.string().trim().min(1, "Add a title").max(200),
  organisation: z.string().trim().max(200).optional(),
  url: z.string().trim().max(500).optional(),
  location: z.string().trim().max(200).optional(),
  happens_on: z.string().trim().max(100).optional(),
  details: z.string().trim().max(2000).optional(),
  submitter_name: z.string().trim().min(1, "Add your name").max(120),
  submitter_email: z.string().trim().email("Enter a valid email").max(255),
});

const kinds = [
  { value: "event", label: "Event" },
  { value: "job", label: "Job" },
  { value: "offer", label: "Offer / programme" },
] as const;

function SubmitPage() {
  const [kind, setKind] = useState<"event" | "job" | "offer">("event");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const parsed = schema.safeParse({
      kind,
      title: form.get("title"),
      organisation: form.get("organisation"),
      url: form.get("url"),
      location: form.get("location"),
      happens_on: form.get("happens_on"),
      details: form.get("details"),
      submitter_name: form.get("submitter_name"),
      submitter_email: form.get("submitter_email"),
    });

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setStatus("loading");
    setError(null);
    const { error: insertError } = await supabase.from("submissions").insert(parsed.data);
    if (insertError) {
      setStatus("idle");
      setError("Something went wrong. Please try again or email hello@affiliatex.co.");
      return;
    }
    setStatus("done");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="border-b border-border bg-surface py-14 lg:py-20">
          <div className="mx-auto max-w-3xl px-4">
            <h1 className="font-display text-4xl font-bold sm:text-5xl">
              Submit an event, job or offer
            </h1>
            <p className="mt-4 text-muted-foreground">
              Listings are editorial and free — we include what's genuinely useful to readers.
              Paid placement is handled separately on the sponsor page.
            </p>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-4">
            {status === "done" ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
                <h2 className="font-display text-xl font-semibold">Thanks — we've got it</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We review submissions each Tuesday. If it's a fit, it'll appear in an upcoming
                  Thursday issue.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-card sm:p-8"
              >
                <fieldset>
                  <legend className="text-sm font-medium">What are you submitting?</legend>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {kinds.map((k) => (
                      <Button
                        key={k.value}
                        type="button"
                        variant={kind === k.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setKind(k.value)}
                      >
                        {k.label}
                      </Button>
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" name="title" maxLength={200} required className="mt-1.5" />
                  </div>
                  <div>
                    <Label htmlFor="organisation">Company or organiser</Label>
                    <Input
                      id="organisation"
                      name="organisation"
                      maxLength={200}
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="url">Link</Label>
                    <Input
                      id="url"
                      name="url"
                      type="url"
                      maxLength={500}
                      placeholder="https://"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      name="location"
                      maxLength={200}
                      placeholder="City, country or Remote"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="happens_on">Date or deadline</Label>
                    <Input
                      id="happens_on"
                      name="happens_on"
                      maxLength={100}
                      placeholder="e.g. 20 March 2027"
                      className="mt-1.5"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label htmlFor="details">Details</Label>
                    <Textarea
                      id="details"
                      name="details"
                      maxLength={2000}
                      rows={5}
                      placeholder="What should readers know? Commission terms, salary range, agenda — whatever is relevant."
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="submitter_name">Your name</Label>
                    <Input
                      id="submitter_name"
                      name="submitter_name"
                      maxLength={120}
                      required
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="submitter_email">Your email</Label>
                    <Input
                      id="submitter_email"
                      name="submitter_email"
                      type="email"
                      maxLength={255}
                      required
                      className="mt-1.5"
                    />
                  </div>
                </div>

                {error ? <p className="text-sm text-destructive">{error}</p> : null}

                <Button type="submit" size="lg" disabled={status === "loading"}>
                  {status === "loading" ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    "Send submission"
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  We use your email only to follow up on this submission.
                </p>
              </form>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
