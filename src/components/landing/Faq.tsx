import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const faqs = [
  {
    q: "What exactly is AffiliateX?",
    a: "A weekly email newsletter for people working in affiliate marketing. Each issue covers industry news, new offers and programmes, affiliate jobs, and upcoming events.",
  },
  {
    q: "How often is it sent?",
    a: "Once a week, every Thursday morning. One email, nothing else — we don't send daily blasts.",
  },
  {
    q: "Is it free?",
    a: "Yes. AffiliateX is completely free to read. It's supported by the occasional clearly-marked sponsor.",
  },
  {
    q: "Who is it for?",
    a: "Affiliates and publishers, affiliate and partnership managers, media buyers, and network teams — from people running their first site to teams managing eight-figure programmes.",
  },
  {
    q: "Can I submit an event, job or offer?",
    a: "Yes. Email hello@affiliatex.co with the details and we'll consider it for an upcoming issue. Listings are editorial, not paid placements.",
  },
  {
    q: "How do I unsubscribe?",
    a: "Every issue has a one-click unsubscribe link at the bottom. No questions, no retention emails.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="border-b border-border py-16 lg:py-24">
      <div className="mx-auto max-w-3xl px-4">
        <div className="text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="mt-10 w-full">
          {faqs.map((item, i) => (
            <AccordionItem key={item.q} value={`item-${i}`}>
              <AccordionTrigger className="text-left font-medium">{item.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
