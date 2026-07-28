import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { Check, Copy, Loader2, Link2, ShieldCheck, Sparkles, Star } from "lucide-react";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Breadcrumbs } from "@/components/site/Breadcrumbs";
import { COLLECTIONS } from "@/integrations/firebase/config";
import { fsCreate, nowIso } from "@/integrations/firebase/firestore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SITE_NAME, SITE_URL, CONTACT_EMAIL } from "@/lib/site";
import logoAsset from "@/assets/taw-logo.png.asset.json";

const title = "Submit an affiliate event, job or deal — The Affiliate Week";
const description =
  "Get your affiliate event, job or deal in front of thousands of affiliate operators. Free editorial listings — or list free by adding our badge and a backlink from your site.";

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
  { value: "offer", label: "Deal" },
] as const;

const badgeDark = `<a href="${SITE_URL}" target="_blank" rel="noopener">
  <img src="${logoAsset.url}" alt="Featured in ${SITE_NAME}" width="200" />
</a>`;

const badgeText = `<a href="${SITE_URL}" target="_blank" rel="noopener">Featured in ${SITE_NAME}</a>`;

const faqs = [
  {
    q: "Does it cost anything to be listed?",
    a: "No. Every listing in the newsletter is editorial and free. We publish what is genuinely useful to affiliate operators — you never have to pay to be considered.",
  },
  {
    q: "Then what is the backlink for?",
    a: "It is a fair swap, not a fee. We send you readers and a permanent link from our site; a badge and link back from yours helps more people in the industry find the newsletter. It also moves your submission up the review queue.",
  },
  {
    q: "How long does review take?",
    a: "We review submissions every Tuesday and publish on Thursday. If it is a fit, you will normally see it within one or two issues.",
  },
  {
    q: "What makes a submission get rejected?",
    a: "Thin or expired deals, roles that are not affiliate or partnerships related, pay-to-play content dressed up as news, and anything we cannot verify on a real website.",
  },
  {
    q: "Can I edit a listing after it goes out?",
    a: `Email ${CONTACT_EMAIL} and we will update the listing on site. The email issue itself cannot be changed once sent.`,
  },
  {
    q: "What if I want guaranteed placement?",
    a: "That is sponsorship — a dedicated slot at the top of the issue with copy you control. See the sponsor page for availability.",
  },
];

function CopyBox({ label, code }: { label: string; code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2">
        <span className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => {
            void navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1600);
          }}
        >
          {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <pre className="overflow-x-auto px-3 py-3 text-xs leading-relaxed text-muted-foreground">
        <code>{code}</code>
      </pre>
    </div>
  );
}

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
    try {
      await fsCreate(COLLECTIONS.submissions, {
        ...parsed.data,
        status: "new",
        admin_notes: null,
        created_at: nowIso(),
      });
    } catch {
      setStatus("idle");
      setError(`Something went wrong. Please try again or email ${CONTACT_EMAIL}.`);
      return;
    }
    setStatus("done");
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="bg-primary text-primary-foreground py-14 lg:py-20">
          <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
            <Breadcrumbs items={[{ label: "Submit" }]} />
            <h1 className="mt-4 font-display text-4xl font-bold sm:text-5xl">
              Submit an event, job or deal
            </h1>
            <p className="mt-4 text-primary-foreground/85">
              Get in front of affiliate managers, media buyers and partnership leads who read every
              Thursday. Listings are editorial and free — the only thing we ask is a link back.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-semibold">
              {[
                { icon: ShieldCheck, label: "Human review, every Tuesday" },
                { icon: Sparkles, label: "Free editorial listing" },
                { icon: Link2, label: "Link back, move up the queue" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1.5"
                >
                  <Icon className="size-3.5" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
            {status === "done" ? (
              <div className="rounded-xl border border-border bg-card p-8 text-center shadow-card">
                <h2 className="font-display text-xl font-semibold">Thanks — we've got it</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  We review submissions each Tuesday. If it's a fit, it'll appear in an upcoming
                  Thursday issue.
                </p>
                <p className="mt-4 text-sm text-muted-foreground">
                  Want it looked at first? Add the badge below to your site and reply to our
                  confirmation email with the URL.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-card sm:p-8"
              >
                <div>
                  <h2 className="font-display text-lg font-semibold">Submission details</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Two minutes. The more specific you are, the more likely we run it.
                  </p>
                </div>

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

        {/* Ways to get listed */}
        <section className="border-t border-border bg-muted/40 py-12 lg:py-16">
          <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Two ways to get listed</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              You never have to pay to appear in the newsletter. Paying only buys certainty and
              position — everything else is earned editorially.
            </p>

            <div className="mt-8 grid gap-5 md:grid-cols-2">
              <div className="relative rounded-xl border-2 border-signal bg-card p-6 shadow-card">
                <span className="absolute -top-3 left-6 rounded-full bg-signal px-3 py-1 font-display text-[11px] font-bold uppercase tracking-[0.14em] text-signal-foreground">
                  Most submissions
                </span>
                <h3 className="mt-2 font-display text-xl font-semibold">
                  Free listing — link back to us
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  No fee, ever. Add our badge to your site and we'll fast-track the review.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {[
                    "Editorial slot in the Thursday issue",
                    "Permanent, indexable listing page on our site (a real dofollow link to you)",
                    "Priority review when your badge is live",
                    "Re-submit as often as you have something worth running",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-signal" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="mt-6 w-full">
                  <a href="#badge">Get the badge code</a>
                </Button>
              </div>

              <div className="rounded-xl border border-border bg-card p-6 shadow-card">
                <h3 className="font-display text-xl font-semibold">Sponsored placement</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  For launches with a date to hit. Guaranteed position, your copy, your creative.
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {[
                    "Top-of-issue slot on a date you choose",
                    "You write the copy, we keep it readable",
                    "Logo, image and tracked links",
                    "Open and click reporting after send",
                  ].map((item) => (
                    <li key={item} className="flex gap-2">
                      <Star className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="mt-6 w-full">
                  <Link to="/sponsor">See sponsorship options</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Badge / backlink */}
        <section id="badge" className="scroll-mt-24 py-12 lg:py-16">
          <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-border bg-card p-6 shadow-card sm:p-8">
              <div className="flex flex-wrap items-center gap-2">
                <Link2 className="size-5 text-signal" />
                <h2 className="font-display text-2xl font-bold">
                  Can't pay? Link to us instead — it's genuinely worth more
                </h2>
              </div>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                We're a small independent newsletter, not an ad network. Money isn't what keeps this
                going — readers are. A badge on your site puts us in front of the exact people we
                write for, and in return you get an editorial slot, a permanent listing page and a
                real link from a site the industry reads. It takes four minutes and costs nothing.
              </p>

              <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  "Send your submission using the form above.",
                  "Copy one of the snippets below.",
                  "Paste it in your footer, partners page or press page.",
                  `Reply to our email with the live URL — we verify and prioritise it.`,
                ].map((step, index) => (
                  <li key={step} className="rounded-lg border border-border bg-muted/40 p-4">
                    <span className="font-display text-xs font-bold uppercase tracking-[0.14em] text-signal">
                      Step {index + 1}
                    </span>
                    <p className="mt-1.5 text-sm">{step}</p>
                  </li>
                ))}
              </ol>

              <div className="mt-8 grid gap-5 lg:grid-cols-2">
                <div className="space-y-3">
                  <div className="flex items-center justify-center rounded-lg border border-border bg-navy p-6">
                    <img
                      src={logoAsset.url}
                      alt={`Featured in ${SITE_NAME} badge`}
                      className="h-10 w-auto brightness-0 invert"
                    />
                  </div>
                  <CopyBox label="Badge — image + link" code={badgeDark} />
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-center rounded-lg border border-border bg-background p-6">
                    <span className="font-display text-sm font-semibold">
                      Featured in <span className="text-signal">{SITE_NAME}</span>
                    </span>
                  </div>
                  <CopyBox label="Text link only" code={badgeText} />
                </div>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                Keep the badge live while your listing is on site. If the link disappears, the
                listing stays — we just won't fast-track the next one.
              </p>
            </div>
          </div>
        </section>

        {/* Terms disclosure */}
        <section className="border-t border-border bg-muted/40 py-12 lg:py-16">
          <div className="mx-auto max-w-5xl px-5 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold">How submissions are handled</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {[
                {
                  heading: "Review process",
                  points: [
                    "Every submission is read by a person",
                    "Reviewed Tuesdays, published Thursdays",
                    "We may ask for extra detail or proof",
                    "We may edit for length, clarity and house style",
                  ],
                },
                {
                  heading: "What we look for",
                  points: [
                    "Useful and current for affiliate operators",
                    "A working link and a real, live website",
                    "Clear terms — commission, salary, dates",
                    "No spam, scraped or misleading claims",
                  ],
                },
                {
                  heading: "Updates and removals",
                  points: [
                    "Corrections are free — just email us",
                    "Expired listings are removed automatically",
                    `Removal requests honoured within 48 hours at ${CONTACT_EMAIL}`,
                    "We can decline or pull anything at our discretion",
                  ],
                },
                {
                  heading: "Fair use of your details",
                  points: [
                    "Your email is used only for this submission",
                    "We never sell or share contact details",
                    "Submitted copy may be used in the issue and on site",
                    "You confirm you have the right to submit it",
                  ],
                },
              ].map((block) => (
                <div key={block.heading} className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-display text-base font-semibold">{block.heading}</h3>
                  <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                    {block.points.map((point) => (
                      <li key={point} className="flex gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-signal" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs text-muted-foreground">
              By submitting you agree to our{" "}
              <Link to="/terms" className="underline underline-offset-2">
                Terms
              </Link>{" "}
              and{" "}
              <Link to="/privacy" className="underline underline-offset-2">
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-12 lg:py-16">
          <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
            <h2 className="font-display text-2xl font-bold">Submission FAQ</h2>
            <Accordion type="single" collapsible className="mt-6">
              {faqs.map((faq) => (
                <AccordionItem key={faq.q} value={faq.q}>
                  <AccordionTrigger className="text-left font-display text-base font-semibold">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <p className="mt-6 text-sm text-muted-foreground">
              Still stuck?{" "}
              <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-2">
                {CONTACT_EMAIL}
              </a>
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
