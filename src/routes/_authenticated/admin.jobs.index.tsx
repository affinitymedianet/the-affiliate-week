import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import {
  RecordTable,
  validateListSearch,
  type ListSearch,
} from "@/components/admin/RecordTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/jobs/")({
  validateSearch: validateListSearch,
  component: JobsListPage,
});

function JobsListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  return (
    <RecordTable
      entityKey="jobs"
      search={search}
      onSearchChange={(next: Partial<ListSearch>) =>
        navigate({ to: "/admin/jobs", search: (prev) => ({ ...prev, ...next }) })
      }
      newButton={
        <Button asChild>
          <Link to="/admin/jobs/new">
            <Plus className="size-4" /> New Job
          </Link>
        </Button>
      }
      renderEditLink={(id, label) => (
        <Button asChild size="sm" variant="ghost">
          <Link to="/admin/jobs/$id" params={{ id }}>
            {label}
          </Link>
        </Button>
      )}
    />
  );
}
