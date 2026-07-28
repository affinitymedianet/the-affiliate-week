import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import {
  RecordTable,
  validateListSearch,
  type ListSearch,
} from "@/components/admin/RecordTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/deals/")({
  validateSearch: validateListSearch,
  component: DealsListPage,
});

function DealsListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  return (
    <RecordTable
      entityKey="deals"
      search={search}
      onSearchChange={(next: Partial<ListSearch>) =>
        navigate({ to: "/admin/deals", search: (prev) => ({ ...prev, ...next }) })
      }
      newButton={
        <Button asChild>
          <Link to="/admin/deals/new">
            <Plus className="size-4" /> New Deal
          </Link>
        </Button>
      }
      renderEditLink={(id, label) => (
        <Button asChild size="sm" variant="ghost">
          <Link to="/admin/deals/$id" params={{ id }}>
            {label}
          </Link>
        </Button>
      )}
    />
  );
}
