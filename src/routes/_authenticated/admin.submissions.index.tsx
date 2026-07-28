import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { InboxTable } from "@/components/admin/InboxTable";
import { validateListSearch, type ListSearch } from "@/components/admin/RecordTable";
import { Button } from "@/components/ui/button";

export const SUBMISSION_COLUMNS = [
  { key: "title", label: "Title" },
  { key: "kind", label: "Type" },
  { key: "organisation", label: "Organisation" },
  { key: "location", label: "Location" },
  { key: "happens_on", label: "Date" },
  { key: "url", label: "URL" },
  { key: "details", label: "Details" },
  { key: "submitter_name", label: "Submitted by" },
  { key: "submitter_email", label: "Email" },
];

export const Route = createFileRoute("/_authenticated/admin/submissions/")({
  validateSearch: validateListSearch,
  component: SubmissionsListPage,
});

function SubmissionsListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  return (
    <InboxTable
      kind="submissions"
      title="Submissions"
      description="Events, jobs and offers sent in by readers. Accept one and add it to the right board."
      columns={SUBMISSION_COLUMNS}
      search={search}
      onSearchChange={(next: Partial<ListSearch>) =>
        navigate({ to: "/admin/submissions", search: (prev: ListSearch) => ({ ...prev, ...next }) })
      }
      renderOpenLink={(id, label) => (
        <Button asChild size="sm" variant="ghost">
          <Link to="/admin/submissions/$id" params={{ id }}>
            {label}
          </Link>
        </Button>
      )}
    />
  );
}
