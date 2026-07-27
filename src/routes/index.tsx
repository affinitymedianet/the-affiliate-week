import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { Hero } from "@/components/landing/Hero";
import { InsideThisIssue } from "@/components/landing/InsideThisIssue";
import { WhatsInside } from "@/components/landing/WhatsInside";
import { WeeklyBoards } from "@/components/landing/WeeklyBoards";
import { Faq, faqs } from "@/components/landing/Faq";
import { EditorNote } from "@/components/landing/EditorNote";
import { StickySubscribeBar } from "@/components/site/StickySubscribeBar";
import { ClosingCta } from "@/components/landing/ClosingCta";
import { SITE_URL } from "@/lib/site";


const title = "The Affiliate Week — The weekly affiliate marketing newsletter";
const description =
  "A free weekly email for affiliate marketers: industry news, new offers, affiliate jobs and the events worth attending. Every Thursday.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "The Affiliate Week",
          url: SITE_URL,
          description,
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <InsideThisIssue />
        <WeeklyBoards />
        <WhatsInside />
        <EditorNote />
        <Faq />
        <ClosingCta />

      </main>
      <SiteFooter />
      <StickySubscribeBar />
    </div>
  );
}
