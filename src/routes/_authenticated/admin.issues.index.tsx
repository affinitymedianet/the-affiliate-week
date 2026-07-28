import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import {
  RecordTable,
  validateListSearch,
  type ListSearch,
} from "@/components/admin/RecordTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/issues/")({
  validateSearch: validateListSearch,
  component: IssuesListPage,
});

function IssuesListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  return (
    <RecordTable
      entityKey="issues"
      search={search}
      onSearchChange={(next: Partial<ListSearch>) =>
        navigate({ to: "/admin/issues", search: (prev) => ({ ...prev, ...next }) })
      }
      newButton={
        <Button asChild>
          <Link to="/admin/issues/new">
            <Plus className="size-4" /> New Issue
          </Link>
        </Button>
      }
      renderEditLink={(id, label) => (
        <Button asChild size="sm" variant="ghost">
          <Link to="/admin/issues/$id" params={{ id }}>
            {label}
          </Link>
        </Button>
      )}
    />
  );
}
