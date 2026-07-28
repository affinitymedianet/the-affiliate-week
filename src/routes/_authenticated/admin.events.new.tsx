import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { RecordForm } from "@/components/admin/RecordForm";
import type { AdminRow } from "@/lib/admin-schema";

export const Route = createFileRoute("/_authenticated/admin/events/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    prefill: typeof search.prefill === "string" ? search.prefill : undefined,
  }),
  component: NewEventPage,
});

function NewEventPage() {
  const navigate = useNavigate();
  const { prefill } = Route.useSearch();

  let initial: AdminRow | undefined;
  if (prefill) {
    try {
      initial = JSON.parse(prefill) as AdminRow;
    } catch {
      initial = undefined;
    }
  }

  return (
    <RecordForm
      entityKey="events"
      id={null}
      prefill={initial}
      breadcrumb={<Breadcrumb label="New Event" />}
      onSaved={(id) => navigate({ to: "/admin/events/$id", params: { id } })}
      onDeleted={() => navigate({ to: "/admin/events" })}
      onCancel={() => navigate({ to: "/admin/events" })}
    />
  );
}

function Breadcrumb({ label }: { label: string }) {
  return (
    <nav className="text-sm text-muted-foreground">
      <Link to="/admin/events" className="hover:text-foreground">
        Events
      </Link>
      <span className="px-2">/</span>
      <span className="text-foreground">{label}</span>
    </nav>
  );
}
