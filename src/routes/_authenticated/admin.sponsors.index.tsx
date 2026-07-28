import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { InboxTable } from "@/components/admin/InboxTable";
import { validateListSearch, type ListSearch } from "@/components/admin/RecordTable";
import { Button } from "@/components/ui/button";

export const SPONSOR_COLUMNS = [
  { key: "company", label: "Company" },
  { key: "name", label: "Contact" },
  { key: "email", label: "Email" },
  { key: "budget", label: "Budget" },
  { key: "website", label: "Website" },
  { key: "message", label: "Message" },
];

export const Route = createFileRoute("/_authenticated/admin/sponsors/")({
  validateSearch: validateListSearch,
  component: SponsorsListPage,
});

function SponsorsListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  return (
    <InboxTable
      kind="sponsor_enquiries"
      title="Sponsor enquiries"
      description="Brands asking about newsletter placements. Track each conversation to a decision."
      columns={SPONSOR_COLUMNS}
      search={search}
      onSearchChange={(next: Partial<ListSearch>) =>
        navigate({ to: "/admin/sponsors", search: (prev: ListSearch) => ({ ...prev, ...next }) })
      }
      renderOpenLink={(id, label) => (
        <Button asChild size="sm" variant="ghost">
          <Link to="/admin/sponsors/$id" params={{ id }}>
            {label}
          </Link>
        </Button>
      )}
    />
  );
}
