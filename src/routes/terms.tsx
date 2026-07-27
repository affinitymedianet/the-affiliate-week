import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const title = "Terms of use — AffiliateX newsletter";
const description =
  "The terms covering use of the AffiliateX website, newsletter subscriptions, editorial listings and sponsored placements.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/terms" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/terms" }],
  }),
  component: TermsPage,
});

const sections = [
  {
    h: "The newsletter",
    p: "AffiliateX is a free weekly email. We aim to send it every Thursday but make no guarantee of frequency, and we may pause or discontinue it at any time.",
  },
  {
    h: "No advice",
    p: "Content is editorial and informational. Commission terms, programme details, job listings and event information are reported in good faith but change often — verify them with the source before acting.",
  },
  {
    h: "Affiliate and sponsored links",
    p: "Some links may be affiliate links, and some placements are paid. Paid placements are labelled as sponsored. Payment never buys favourable editorial coverage.",
  },
  {
    h: "Submissions",
    p: "By submitting an event, job or offer you confirm you have the right to share the information and grant us permission to publish it, edited for length and style. Inclusion is at our discretion and is not guaranteed.",
  },
  {
    h: "Acceptable use",
    p: "You may not scrape the site, republish issues in full without permission, or use the newsletter or submission forms to distribute spam, malware or misleading offers.",
  },
  {
    h: "Liability",
    p: "The site and newsletter are provided as-is. To the extent permitted by law we are not liable for losses arising from reliance on their content.",
  },
  {
    h: "Changes and contact",
    p: "We may update these terms; the current version always lives on this page. Questions: hello@affiliatex.co.",
  },
];

function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <article className="mx-auto max-w-3xl px-4 py-14 lg:py-20">
          <h1 className="font-display text-4xl font-bold">Terms of use</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Working terms for AffiliateX. Have them reviewed before launch.
          </p>
          <div className="mt-10 space-y-8">
            {sections.map((s) => (
              <section key={s.h}>
                <h2 className="font-display text-xl font-semibold">{s.h}</h2>
                <p className="mt-2 leading-relaxed text-muted-foreground">{s.p}</p>
              </section>
            ))}
          </div>
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
