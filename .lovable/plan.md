## Goal

A jobs section for AffiliateX: a browsable list of affiliate industry roles, each with a detail page and an "Apply" button that sends the reader to the employer's own application page.

## Database

New `jobs` table in the backend:

- title, company, location, work type (remote / hybrid / onsite), employment type (full-time / contract / part-time), salary range (text, optional), short summary, full description, apply URL, posted date, expiry date (optional), featured flag, published flag.
- Public read access for published jobs only (anyone can browse); no public write. New roles get added by me or through the existing `/submit` form (kind = `job`), which stays a private review queue.
- Seeded in the same migration with a handful of realistic affiliate-industry roles so the page is never empty.

## Pages

**`/jobs` — listing**
- Header, intro line, and a count of open roles.
- Filters: work type, employment type, location — same pattern and styling as the events page.
- Cards showing title, company, location, work type badge, salary if present, and posted date. Featured roles pinned at top.
- Empty state when filters match nothing.
- Sidebar/inline CTA: newsletter signup ("jobs go out every Thursday") and a link to `/submit` for employers posting a role.

**`/jobs/$jobId` — detail**
- Full description, all metadata, "Apply on company site" button opening the apply URL in a new tab (`rel="noopener noreferrer"`), plus a back link and a newsletter CTA under the listing.
- Not-found handling for unknown or unpublished IDs.

## Navigation & cross-links

- "Jobs" added to the header nav and footer nav.
- A small "Latest jobs" preview block on the home page (3 roles → `/jobs`), matching the existing events preview.
- Events page and jobs page cross-link each other.

## SEO

- Unique title/description/og tags on both routes.
- `JobPosting` JSON-LD on each detail page (title, hiring organisation, location, employment type, dates, apply URL) so roles can appear in Google Jobs.
- Single H1 per page, semantic markup.

## Technical notes

- Reads happen through a public server function using the publishable key against a narrow anon-select policy limited to published rows — same approach as other public data, no admin client.
- Listing and detail fetched in the route loader via TanStack Query so pages render server-side for crawlers; both routes get `errorComponent` and `notFoundComponent`.
- Apply URLs are validated to http/https before rendering the button.
