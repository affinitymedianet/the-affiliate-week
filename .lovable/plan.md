## AffiliateX — weekly affiliate newsletter landing site

A single, long-scroll landing page at `/` modeled on the uploaded reference, plus supporting routes, built for affiliatex.co.

### Page structure (order follows the reference)
1. **Sticky nav** — logo, links (Offers, Jobs, Events, Blog), "Subscribe" button.
2. **Hero** — "Your complete affiliate marketing resource hub", subcopy about the weekly newsletter, email capture + Subscribe CTA, small social proof row (avatars + "5k+ marketers"), laptop/dashboard image on the right.
3. **Everything You Need** — 6 category cards (Affiliate Offers, Tools, Jobs, Events, Networking, Blogs) with illustration art.
4. **Featured Affiliate Offers** — 3 offer cards with payout badges and "View Details".
5. **Featured Events** — 3 event cards with date chip, cover image, "View Details".
6. **Limited-Time Deals** — 3 deal cards in a horizontal carousel with arrows.
7. **Latest Insights & Tips** — 3 blog cards with cover, category, date, read time.
8. **FAQ** — accordion, 6 questions about the newsletter.
9. **Testimonials** — 3 quote cards with stars and author.
10. **Trusted by** — logo strip of affiliate networks/brands.
11. **Newsletter band** — dark navy band, email input + Subscribe.
12. **Final CTA** — "Ready to find better affiliate opportunities?"
13. **Footer** — 4 link columns + legal row.

### Newsletter signup
Signups are real, not decorative: Lovable Cloud stores subscribers in a `subscribers` table (email unique, source, created_at) with insert-only public access and no public reads. Both the hero and footer forms write to it, with duplicate-safe handling and inline success/error states.

### Design system
Navy/white/blue palette taken from the reference — deep navy (`#152238`-ish) for dark bands and CTAs, bright blue accent for buttons and badges, off-white section backgrounds alternating with white. Clean geometric sans (Plus Jakarta Sans headings / Inter-alternative body via a distinctive pairing), medium radius cards, soft shadows. All values go into `src/styles.css` as oklch tokens — no hardcoded colors in components.

### Images
Generated assets under `src/assets/`: hero dashboard laptop shot, 6 category illustrations, 3 event covers, 3 deal covers, 3 blog covers. Uploaded screenshot is reference only, not embedded.

### Content
Placeholder-but-realistic affiliate industry copy (offers with payouts, real-sounding event names, job/blog titles) that you can swap later.

### Technical notes
- TanStack Start file routes: `src/routes/index.tsx` rewritten as the landing page; sections split into components under `src/components/landing/`.
- Deals carousel uses embla (shadcn Carousel); FAQ uses shadcn Accordion.
- SEO: unique title/description/og/twitter in `index.tsx` head(), single H1, semantic sections, alt text, JSON-LD `Organization` + `NewsletterService`.
- Lovable Cloud enabled for the subscriber table; signup happens through a server function so the table stays write-only to the public.
