import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const faqs = [
  {
    q: "What exactly is The Affiliate Week?",
    a: "A weekly email newsletter for people working in affiliate marketing. Each issue covers industry news, new offers and programmes, affiliate jobs, and upcoming events.",
  },
  {
    q: "How often is it sent?",
    a: "Once a week, every Thursday morning. One email, nothing else — we don't send daily blasts.",
  },
  {
    q: "Is it free?",
    a: "Yes. The Affiliate Week is completely free to read. It's supported by the occasional clearly-marked sponsor.",
  },
  {
    q: "Who is it for?",
    a: "Affiliates and publishers, affiliate and partnership managers, media buyers, and network teams — from people running their first site to teams managing eight-figure programmes.",
  },
  {
    q: "Can I submit an event, job or offer?",
    a: "Yes. Email hello@theaffiliateweek.com with the details and we'll consider it for an upcoming issue. Listings are editorial, not paid placements.",
  },
  {
    q: "How do I unsubscribe?",
    a: "Every issue has a one-click unsubscribe link at the bottom. No questions, no retention emails.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-b border-rule bg-background py-16 lg:py-20">
      <div className="mx-auto max-w-3xl px-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal">Questions</p>
        <h2 className="mt-1.5 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Frequently asked questions
        </h2>

        <Accordion type="single" collapsible className="mt-8 w-full border-t border-rule">
          {faqs.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`} className="border-rule">
              <AccordionTrigger className="text-left font-display text-base font-semibold">
                {item.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );

}
