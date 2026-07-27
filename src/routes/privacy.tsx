import { createFileRoute } from "@tanstack/react-router";

import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";

const title = "Privacy policy — AffiliateX newsletter";
const description =
  "How AffiliateX collects, stores and uses your email address, what we never do with it, and how to unsubscribe or request deletion.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "/privacy" }],
  }),
  component: PrivacyPage,
});

const sections = [
  {
    h: "What we collect",
    p: "When you subscribe we store your email address, which page you subscribed from, and the date. If you submit an event, job or offer, or enquire about sponsorship, we also store the name, email and details you enter in that form.",
  },
  {
    h: "Why we collect it",
    p: "Your email is used to send you the AffiliateX newsletter and, where relevant, to reply to a submission or sponsorship enquiry you sent us. Our lawful basis is your consent, given when you submit the form.",
  },
  {
    h: "What we never do",
    p: "We do not sell, rent or share your email address with sponsors or any third party. Sponsors receive aggregate audience information only — never individual subscriber data.",
  },
  {
    h: "Processors",
    p: "Subscriber and submission records are stored in our hosted application database, and emails are delivered through our email sending provider. These providers process data on our behalf and are not permitted to use it for their own purposes.",
  },
  {
    h: "Retention",
    p: "We keep your email address until you unsubscribe or ask us to delete it. Unsubscribed addresses are retained in a suppression record so we do not accidentally email you again.",
  },
  {
    h: "Your rights",
    p: "You can unsubscribe with the one-click link in any issue. You can also ask us to confirm what we hold about you, correct it, or delete it entirely — email hello@affiliatex.co and we will action it within 30 days.",
  },
  {
    h: "Cookies",
    p: "The site does not set advertising or cross-site tracking cookies. Any analytics we add will be limited to aggregate page-level measurement, and this page will be updated before it is enabled.",
  },
  {
    h: "Contact",
    p: "Questions about this policy: hello@affiliatex.co. Add your registered postal address here before sending your first issue — bulk email law in most territories requires it.",
  },
];

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <article className="mx-auto max-w-3xl px-4 py-14 lg:py-20">
          <h1 className="font-display text-4xl font-bold">Privacy policy</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This is a working policy for AffiliateX. Have it reviewed against your jurisdiction
            before launch.
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
