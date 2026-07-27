## Goal

Replace the current split hero (background image + four preview cards) with a compact, full-bleed Morning Brew-style colour band in our brand blue.

## New hero layout

```text
┌──────────────────────────────────────────────────────────────┐
│  [ BLUE BAND ]                                               │
│  Issue #N · Thursdays · Free        ┌──────────────────────┐ │
│  The affiliate industry,            │ Email                │ │
│  every week.                        └──────────────────────┘ │
│  One email every Thursday with       ┌──────────────────────┐ │
│  news, jobs, events and deals.       │      Subscribe       │ │
│                                      └──────────────────────┘ │
│                                   By subscribing you accept   │
│                                   our Terms & Privacy Policy. │
└──────────────────────────────────────────────────────────────┘
```

- Two-column grid on desktop (copy left, form right), stacked on mobile.
- Solid brand-blue background, white serif display headline, lighter-white supporting line.
- Small amber kicker line above the headline for the issue/cadence signal.
- Stacked form: full-width white email input, then a full-width near-black Subscribe button beneath it.
- Fine print under the button links to `/terms` and `/privacy`.
- No background image, no vignette, no preview cards.

## Changes

- `src/components/landing/Hero.tsx` — rewritten as the band; drops the `heroBg` asset, the React Query calls for jobs/deals, the events/issue preview data, and the `PreviewCard` component.
- `src/components/NewsletterForm.tsx` — add an optional stacked/on-dark variant so the input and button render full width with the correct contrast inside the band. Existing usages elsewhere keep their current appearance.
- `src/styles.css` — only if a token is missing for the near-black button; otherwise reuse existing navy/foreground tokens.
- Homepage section order below the hero is unchanged.

## Notes

Removing the preview cards means the first thing after the hero becomes the existing "Inside this issue" section, which still shows what subscribers get — so the proof isn't lost.
