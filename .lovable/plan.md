## Admin review — what is genuinely missing

I checked the Control Room against what a weekly newsletter actually needs to run. Five gaps are mandatory; everything else can wait.

### 1. Issues are not manageable (biggest gap)
The archive and every `/issues/...` page read from a hardcoded file in the codebase. That means you cannot publish this week's issue without a code change — the core weekly workflow has no admin screen.

Fix: an `issues` table (slug, title, dek, issue number, published date, cover, body sections, published flag) plus an **Issues** section in the Control Room using the same manager pattern as Jobs/Deals/Events, and switch the archive, issue pages, homepage "Inside this issue" and sitemap to read from the database.

### 2. Scheduled publishing does nothing
Jobs, deals and events already have a `publish_at` field, but nothing on the public site respects it — a record is either live or not. Anything scheduled for later shows immediately.

Fix: honour `publish_at` in every public query and in the sitemap, surface a "Scheduled" status in the admin list, and add a date/time picker to the editor.

### 3. No file uploads for brand assets
Settings only accepts URLs for logo, dark logo, favicon and share image, and there is no storage set up. You currently have nowhere to host those files.

Fix: create a public `brand` storage bucket (staff-only writes), and add drag-and-drop upload to Settings and to event/deal cover images, with instant preview.

### 4. Subscriber list has no hygiene tools
You can export CSV, but you cannot search, remove a subscriber, or handle an unsubscribe request. That is a legal requirement under GDPR/CAN-SPAM as soon as you send.

Fix: search + pagination on the subscribers table, admin delete, a `status` field (active / unsubscribed / bounced), and a public one-click `/unsubscribe` page linked from your emails.

### 5. Staff account controls are incomplete
Admins can create staff and set roles, but there is no way to send a password reset, or revoke access from someone who has left (role removal alone leaves the login working).

Fix: "Send reset link" and "Deactivate account" actions on the Team page, both admin-only and both written to the audit log.

### Explicitly not doing now
Newsletter provider API sync (Beehiiv/Mailchimp) — the settings fields exist but real syncing should wait until you have chosen a sending platform. Analytics dashboards, comment threads and A/B tools are premature.

### Technical notes
- New table `public.issues` with GRANTs, RLS mirroring the deals/jobs pattern (public read where `published` and `publish_at` has passed, staff write, admin delete), and the existing `update_updated_at_column` trigger.
- `subscribers` gains `status` and `unsubscribed_at`; the unsubscribe page uses a signed token via a public server route so no auth is required.
- Public list queries in `deals.functions.ts`, `jobs.functions.ts`, `events.functions.ts` and the new issues module all get an `or(publish_at.is.null,publish_at.lte.now)` filter.
- Storage bucket `brand`, public read, insert/update restricted to `is_staff(auth.uid())`.
- Password reset and deactivation run through admin-only server functions with a role check before touching the admin client, logged to `audit_log`.
