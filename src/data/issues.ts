export type IssueSection = {
  heading: string;
  items: { title: string; body: string }[];
};

export type Issue = {
  slug: string;
  number: number;
  title: string;
  date: string;
  isoDate: string;
  readingTime: string;
  summary: string;
  sections: IssueSection[];
};

export const sampleIssue: Issue = {
  slug: "sample-issue",
  number: 1,
  title: "Issue #1 — What a typical Thursday looks like",
  date: "Thursday, 6 August 2026",
  isoDate: "2026-08-06",
  readingTime: "5 min read",
  summary:
    "A representative issue of The Affiliate Week: the week's industry news, new programmes worth testing, open affiliate roles, and the events on the calendar.",
  sections: [
    {
      heading: "Industry news",
      items: [
        {
          title: "Networks tighten cookie-window disclosure",
          body: "Several large networks now surface the real attribution window on the offer page rather than in the terms PDF. If you run comparison content, re-check the windows on your top ten offers — a few quietly shortened from 30 days to 7.",
        },
        {
          title: "Consent-mode traffic is still under-reporting",
          body: "Publishers report a 4–9% gap between network-side conversions and their own tracking in EU traffic. Worth reconciling monthly rather than trusting either number alone.",
        },
      ],
    },
    {
      heading: "New programmes & offers",
      items: [
        {
          title: "Three B2B SaaS programmes now paying recurring",
          body: "All three moved from a one-off bounty to 20–25% recurring for 12 months. Recurring changes the maths on paid traffic — model payback over the full term before you scale.",
        },
        {
          title: "A retail brand raised commission for content partners only",
          body: "Coupon and loyalty partners stay on the old rate. If you publish reviews, ask your manager to be re-tiered; it is rarely applied automatically.",
        },
      ],
    },
    {
      heading: "Affiliate jobs",
      items: [
        {
          title: "Affiliate Manager — remote, EU timezones",
          body: "Mid-size e-commerce brand, programme in the low seven figures, reporting to the Head of Growth.",
        },
        {
          title: "Partnerships Lead — London, hybrid",
          body: "Fintech, first partnerships hire, budget to build the channel from scratch.",
        },
      ],
    },
    {
      heading: "Events",
      items: [
        {
          title: "Performance Marketing Meetup — London, 20 March",
          body: "Free, and consistently the best value networking evening in the UK calendar.",
        },
        {
          title: "Media Buyers Workshop — online, 28 March",
          body: "Practical session on scaling paid traffic to affiliate offers without burning creative.",
        },
      ],
    },
    {
      heading: "One tactic that worked",
      items: [
        {
          title: "Refreshing dates in evergreen comparison posts",
          body: "An operator running 40 review pages re-published each with genuinely updated pricing and screenshots — not just a changed date — and recovered roughly a third of lost positions within six weeks.",
        },
      ],
    },
  ],
};

export const issues: Issue[] = [sampleIssue];
