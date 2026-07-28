import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import {
  RecordTable,
  validateListSearch,
  type ListSearch,
} from "@/components/admin/RecordTable";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_authenticated/admin/events/")({
  validateSearch: validateListSearch,
  component: EventsListPage,
});

function EventsListPage() {
  const search = Route.useSearch();
  const navigate = useNavigate();

  return (
    <RecordTable
      entityKey="events"
      search={search}
      onSearchChange={(next: Partial<ListSearch>) =>
        navigate({ to: "/admin/events", search: (prev) => ({ ...prev, ...next }) })
      }
      newButton={
        <Button asChild>
          <Link to="/admin/events/new">
            <Plus className="size-4" /> New Event
          </Link>
        </Button>
      }
      renderEditLink={(id, label) => (
        <Button asChild size="sm" variant="ghost">
          <Link to="/admin/events/$id" params={{ id }}>
            {label}
          </Link>
        </Button>
      )}
    />
  );
}
