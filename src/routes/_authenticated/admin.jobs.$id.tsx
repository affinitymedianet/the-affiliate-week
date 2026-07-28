import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { RecordForm } from "@/components/admin/RecordForm";

export const Route = createFileRoute("/_authenticated/admin/jobs/$id")({
  component: EditJobPage,
});

function EditJobPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  return (
    <RecordForm
      key={id}
      entityKey="jobs"
      id={id}
      breadcrumb={
        <nav className="text-sm text-muted-foreground">
          <Link to="/admin/jobs" className="hover:text-foreground">
            Jobs
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">Edit</span>
        </nav>
      }
      onSaved={() => undefined}
      onDeleted={() => navigate({ to: "/admin/jobs" })}
      onCancel={() => navigate({ to: "/admin/jobs" })}
    />
  );
}
