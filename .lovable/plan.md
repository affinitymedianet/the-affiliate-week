Update the site header so submissions are handled via Typeform instead of the in-house /submit page link.

## Changes

1. **Add a Typeform URL constant**
   - Add `TYPEFORM_SUBMIT_URL` to `src/lib/site.ts` as a configurable placeholder (e.g., `https://form.typeform.com/to/REPLACE_ME`).
   - The user will replace this with their real Typeform link before publishing.

2. **Remove the Submit nav link from the header**
   - Remove the `{ label: "Submit", to: "/submit" }` entry from the `links` array in `src/components/site/SiteHeader.tsx`.
   - The `/submit` page itself remains available for direct traffic but is no longer promoted in the main nav.

3. **Rename the header CTA button to "Submit"**
   - In `src/components/site/SiteHeader.tsx`, change the desktop and mobile CTA button text from "Subscribe free" to "Submit".
   - Link it to `TYPEFORM_SUBMIT_URL` instead of `/#newsletter`.
   - Open the Typeform in a new tab (`target="_blank" rel="noopener noreferrer"`) so visitors stay on the site.

## Technical notes

- The newsletter signup form in the hero and footer stays unchanged.
- The existing `/submit` route and its backend table remain intact; only the header promotion changes.
- After the change, the header nav will read: Archive, Jobs, Deals, Events, Sponsor, FAQ — with a "Submit" CTA button pointing to Typeform.