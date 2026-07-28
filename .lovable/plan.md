## Goal

Every admin record type gets real pages instead of dialogs and expandable rows: a list page, a "new" page, and an edit page — each with full create/read/update/delete, search, filters and pagination that survive refresh and back/forward.

## New admin URL map

```text
/admin/jobs                 list (search, filters, pagination, bulk actions)
/admin/jobs/new             create form (full page)
/admin/jobs/<id>            edit form + delete + publish toggle
   ... same for /admin/deals, /admin/events, /admin/issues

/admin/submissions          list (search, status filter, pagination)
/admin/submissions/<id>     detail page: full record, status buttons, internal notes
/admin/sponsors             list + /admin/sponsors/<id> detail page

/admin/subscribers          list (search, status filter, pagination, bulk delete)
/admin/team                 staff list + role/reset/deactivate actions
/admin/settings             settings form (already a full page)
```

## What changes

**1. Shared list component (`RecordTable`)**
- Table with sortable-by-default ordering, checkbox multi-select, per-row "Edit" link to the record page.
- Search box, plus status filter (All / Live / Scheduled / Draft) and — where relevant — a category/type filter.
- Pagination footer (25 per page) with page numbers, prev/next and a "showing X–Y of Z" line.
- Bulk publish / unpublish / delete, CSV template, bulk import, export — kept from today, moved above the table.
- Search, filter and page live in the URL (`?q=&status=&page=`) using `validateSearch`, so a refresh or shared link keeps the view. Search is debounced and resets to page 1.

**2. Shared form page component (`RecordForm`)**
- Full-width page with breadcrumb ("Jobs → New job" / "Jobs → <title>"), grouped fields, and a sticky action bar: Save, Save & publish, Cancel, and Delete (edit mode only, with confirm).
- Keeps every field type already supported: text, textarea, date, datetime, boolean, select, url, number, JSON section editor, image upload.
- Unsaved-changes guard when navigating away.
- After create, redirects to the edit page for that record; after delete, back to the list.

**3. Inbox detail pages**
- The accordion in Submissions and Sponsor enquiries is replaced by a list of rows linking to `/admin/submissions/<id>` and `/admin/sponsors/<id>`.
- Detail page shows all fields, the status control, internal notes with an explicit Save, "Delete enquiry" for admins, and prev/next links to move through the queue.
- Submission detail also gets a "Create job/event/deal from this" button that pre-fills the matching new-record form.

**4. Subscribers and Team**
- Subscribers already has search, status filter and pagination — moved onto URL search params for consistency.
- Team keeps a single page (no per-record form needed), with the existing role, reset-link and deactivate actions.

**5. Dialogs removed**
- `RecordManager`'s edit `Dialog` and the CSV import preview dialog are removed; import preview becomes an inline confirm panel on the list page.

## Technical notes

- Route files are split so each entity has `admin.<entity>.index.tsx` (list), `admin.<entity>.new.tsx`, and `admin.<entity>.$id.tsx`; the current single-leaf `admin.<entity>.tsx` files are removed so the router does not treat them as layouts.
- Two new server functions in `src/lib/admin.functions.ts`: `adminGetRecord({ entity, id })` and `adminGetInboxItem({ kind, id })`, both behind the existing staff check, so an edit page can load directly by URL.
- Pagination is client-side over the existing capped list query (1000 rows) to start; if any board grows past that, the list query moves to server-side range + count in a follow-up.
- List and detail routes prime the cache in their loaders under `_authenticated`, so pages render populated on first paint.
- `src/components/admin/RecordManager.tsx` and `InboxManager.tsx` are replaced by `RecordTable.tsx`, `RecordForm.tsx`, `InboxTable.tsx` and `InboxDetail.tsx`; the schema in `src/lib/admin-schema.ts` stays the single source of truth for fields.
