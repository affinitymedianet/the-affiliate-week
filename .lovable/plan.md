## Verified current state

Read: `src/routes/index.tsx`, `src/routes/events.tsx`, `SiteHeader`, `SiteFooter`, `Hero`, `WhatsInside`, `EventsPreview`, `Faq`, `Testimonials`, `ClosingCta`, `NewsletterForm`, `src/data/events.ts`.

Today the site is: one landing page (hero + signup, what's inside, 3 events, FAQ, testimonials, closing CTA), one `/events` list page, and a `subscribers` table insert on submit. There is no archive, no sample issue, no confirmation/welcome email, no legal pages, no submission forms, no sponsor page.

## The review (what I'd change and why)

**1. The trust claims are invented — that's the biggest risk.**
The hero says "Joined by 5,200+ affiliates" and there are three named testimonials with roles ("Jade Ortiz, Cove Commerce") for a newsletter that hasn't shipped issue #1. In this industry people check. Getting caught fabricating social proof kills a newsletter permanently. Replace with honest launch-stage proof: "Issue #1 ships Thursday — be one of the first readers", founder credibility line, and a real testimonial slot to fill later.

**2. Nobody subscribes to a newsletter they can't read first.**
The single highest-converting element for a newsletter site is a visible sample issue. Right now a visitor has zero idea of tone, length or quality. Needs a `/archive` page and one full sample issue page linked from the hero ("Read a sample issue →").

**3. The signup does nothing after the click.**
It writes a row and shows a message. No confirmation email, no welcome email, no expectation-setting. Welcome emails have the highest open rate you'll ever get — wasting it is the classic mistake. Needs a double opt-in confirm + welcome email via the app's email infrastructure (requires a verified `affiliatex.co` sender domain).

**4. You're not capturing the free content you promised.**
The newsletter covers jobs, events and offers, but there's no way for anyone to submit them. Free inbound submissions are what keeps a curated newsletter cheap to run. Needs a `/submit` page (event / job / offer) writing to the backend.

**5. No revenue path.**
Footer says "Advertise with us" → a mailto. Sponsors need numbers, formats and prices before they email. Needs a `/sponsor` page with audience profile, placements and a booking form.

**6. Legal + deliverability gaps.**
No privacy policy, no terms, no physical/postal contact line, no explicit consent wording at the form. CAN-SPAM/GDPR basics — and mailbox providers weigh them.

**7. Events page is under-used as an SEO and habit asset.**
Eight hardcoded events with `url: "#"` — no real links, no filters, no per-event pages, no `Event` JSON-LD. This is the page that earns search traffic and repeat visits between issues.

**8. Smaller conversion fixes.**
Hero fake dashboard image should be replaced by a newsletter preview mock; sticky mobile subscribe bar; "5 minute read, every Thursday, free forever" reassurance next to every form; source attribution already exists in the table but isn't reviewable anywhere.

## Proposed build (in priority order)

**Phase 1 — credibility & conversion**
- Rewrite `Hero` + `ClosingCta` social proof to launch-honest copy; remove the 5,200 figure.
- Replace `Testimonials` with a "Why read AffiliateX" / editor credibility section until real quotes exist.
- New `/archive` route + one full sample issue route, linked from hero, header and footer.
- Swap hero image for a newsletter-issue preview.

**Phase 2 — lifecycle**
- Double opt-in: token column on `subscribers`, confirm route, confirmation + welcome emails through Lovable's managed email (needs `affiliatex.co` sender domain set up first).
- `/thanks` page after signup with a "what happens next" sequence.

**Phase 3 — content flywheel**
- `/submit` page with event/job/offer forms → new `submissions` table (RLS: anon insert only).
- Events upgrade: real URLs, format/location/price filters, per-event detail routes, `Event` JSON-LD.

**Phase 4 — money & compliance**
- `/sponsor` page: audience stats, placements, rates, enquiry form → `sponsor_enquiries` table.
- `/privacy` and `/terms`, consent line under every form, postal contact in footer.

## Technical notes

- New tables (`submissions`, `sponsor_enquiries`, opt-in columns on `subscribers`) each get explicit GRANTs plus anon-insert-only RLS; no anon reads.
- Emails go through the project's managed email routes — this is blocked until a sender domain you own is verified, so Phase 2 may lag Phase 1.
- Archive/sample issue content will be authored as typed data in `src/data/issues.ts` (same pattern as `events.ts`) unless you want it database-backed and editable later.
- Every new route gets its own unique title/description/og tags; archive and event detail pages get JSON-LD.

## What I need from you

- Real subscriber count (or confirm we go launch-honest with no number).
- Whether you own `affiliatex.co` DNS access, for the sending domain.
- Real content for one sample issue, or should I draft a realistic one you edit?
- Sponsorship rates, or placeholder "request rates" form?
