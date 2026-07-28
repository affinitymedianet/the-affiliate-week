import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { RecordForm } from "@/components/admin/RecordForm";

export const Route = createFileRoute("/_authenticated/admin/issues/$id")({
  component: EditIssuePage,
});

function EditIssuePage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  return (
    <RecordForm
      key={id}
      entityKey="issues"
      id={id}
      breadcrumb={
        <nav className="text-sm text-muted-foreground">
          <Link to="/admin/issues" className="hover:text-foreground">
            Issues
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">Edit</span>
        </nav>
      }
      onSaved={() => undefined}
      onDeleted={() => navigate({ to: "/admin/issues" })}
      onCancel={() => navigate({ to: "/admin/issues" })}
    />
  );
}
