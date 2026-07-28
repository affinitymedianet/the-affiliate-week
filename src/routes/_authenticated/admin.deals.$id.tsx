import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { RecordForm } from "@/components/admin/RecordForm";

export const Route = createFileRoute("/_authenticated/admin/deals/$id")({
  component: EditDealPage,
});

function EditDealPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  return (
    <RecordForm
      key={id}
      entityKey="deals"
      id={id}
      breadcrumb={
        <nav className="text-sm text-muted-foreground">
          <Link to="/admin/deals" className="hover:text-foreground">
            Deals
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">Edit</span>
        </nav>
      }
      onSaved={() => undefined}
      onDeleted={() => navigate({ to: "/admin/deals" })}
      onCancel={() => navigate({ to: "/admin/deals" })}
    />
  );
}
