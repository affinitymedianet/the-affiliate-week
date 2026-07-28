## Goal

A private admin area at `/admin` where you can publish content (jobs, deals, events), read everything people submit, and change site settings without a developer.

## Access

- Email + password sign-in at `/auth`. No public sign-ups — you invite admins.
- Roles live in a dedicated `user_roles` table (`admin`, `editor`) so they can't be tampered with from the browser.
- `/admin/*` sits behind an auth gate plus a role check; non-admins get bounced.
- Editors can create and edit content; only admins can delete, manage users, and change settings.

## Admin sections

**1. Dashboard (`/admin`)**
Counts at a glance: published vs draft jobs/deals/events, new submissions, new sponsor enquiries, subscribers this week, upcoming expiries.

**2. Jobs (`/admin/jobs`)**
- Table with search, filter (published/draft/expired, work type), sort, pagination.
- Row actions: edit, duplicate, publish/unpublish, feature/unfeature, delete.
- Bulk select → publish, unpublish, feature, delete, set expiry.
- Single create/edit form with all fields (title, company, location, work type, employment type, salary, summary, description, apply URL, posted/expiry dates, featured, published) and a live preview of the public card.

**3. Deals (`/admin/deals`)**
Same shape as jobs: table, filters, bulk actions, single form (title, vendor, category, deal type, discount label, summary, description, coupon code, deal URL, exclusive, featured, start/expire dates).

**4. Events (`/admin/events`)**
Events move from hardcoded data into the database (the 8 existing events get imported, nothing disappears from the live site). Same table/bulk/form treatment, plus cover-image upload and month grouping.

**5. Bulk import (per section)**
- Upload a CSV or paste rows into a textarea.
- Download a template CSV with the correct headers for that content type.
- Column mapping step, then a preview table showing valid rows, rows with errors (with reasons), and duplicates detected by title+company/vendor/name.
- Choose "import as drafts" or "import and publish".
- Import summary: created, skipped, failed with per-row reasons.

**6. Submissions inbox (`/admin/submissions`)**
- List of everything sent through the submit form, filterable by type (event/job/offer) and status.
- Statuses: new / reviewing / approved / rejected, plus internal notes.
- "Convert to listing" — pre-fills the job/deal/event form from the submission, so approving is one click plus a tidy-up.
- Export to CSV.

**7. Sponsor enquiries (`/admin/sponsors`)**
- Inbox of enquiries with name, company, email, website, budget, message, date.
- Status pipeline: new / contacted / won / lost, plus notes.
- Mailto link and CSV export.

**8. Subscribers (`/admin/subscribers`)**
- List with source (hero/footer/CTA), signup date, search.
- Counts and growth by week.
- CSV export for importing into your sending platform.
- Manual add and remove.

## Settings (`/admin/settings`)

Stored in the database so changes go live immediately.

- **Branding** — logo upload, dark-mode/footer logo variant, favicon upload, site name, tagline.
- **Contact & social** — contact email, social profile links shown in the footer.
- **Legal pages** — rich-text editors for Privacy Policy and Terms, with a "last updated" date shown on the public page.
- **Newsletter / API** — sending platform choice, API key stored as a secret (never shown in plain text), list/audience ID, double opt-in on/off, welcome email on/off, plus a "send test" button to verify the connection.
- **Submissions** — the Typeform URL currently hardcoded in the site becomes editable here.
- **SEO defaults** — default meta title/description template, social share image, Google Analytics / Search Console verification tags.

## Suggested extras

- **Scheduled publishing** — set a go-live date; the item flips to published on its own.
- **Auto-expiry** — jobs and deals hide themselves after their expiry date instead of going stale.
- **Issue composer** — draft weekly issues in the admin, pull in selected jobs/deals/events with one click, publish to `/archive` and export the HTML for your sending tool.
- **Click tracking** — count apply-clicks and deal-clicks so you know what's worth featuring and can prove value to sponsors.
- **Sponsor slots** — mark a job/deal as sponsored with a start/end date and a "Sponsored" badge on the public card.
- **Audit log** — who changed what and when.
- **Redirect manager** — for retiring old URLs without breaking links.
- **Media library** — reuse uploaded images across events and issues.

## Technical notes

- New tables: `user_roles`, `events`, `site_settings` (single row), `admin_notes`/status columns on `submissions` and `sponsor_enquiries`, optional `audit_log` and `click_events`.
- Admin reads and writes go through authenticated server functions with a `has_role()` security-definer check; public pages keep their existing anon-read policies.
- Submissions and sponsor enquiries currently have no read policy at all — an admin-only read policy gets added so the inboxes work.
- Logo/favicon/event images go into a Cloud storage bucket, public read, admin write.
- Newsletter API key is stored as a project secret, not in the settings table.
- CSV parsing happens client-side for preview; the actual insert runs server-side with validation.

## Build order

1. Auth + roles + `/admin` shell and gate
2. Events into the database (import existing 8)
3. Jobs, deals, events tables with single create/edit and bulk actions
4. CSV import
5. Submissions and sponsor inboxes, subscribers
6. Settings page and wiring the public site to read from it
7. Extras, picked from the list above
