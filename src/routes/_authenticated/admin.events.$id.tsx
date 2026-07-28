import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { RecordForm } from "@/components/admin/RecordForm";

export const Route = createFileRoute("/_authenticated/admin/events/$id")({
  component: EditEventPage,
});

function EditEventPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  return (
    <RecordForm
      key={id}
      entityKey="events"
      id={id}
      breadcrumb={
        <nav className="text-sm text-muted-foreground">
          <Link to="/admin/events" className="hover:text-foreground">
            Events
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">Edit</span>
        </nav>
      }
      onSaved={() => undefined}
      onDeleted={() => navigate({ to: "/admin/events" })}
      onCancel={() => navigate({ to: "/admin/events" })}
    />
  );
}
