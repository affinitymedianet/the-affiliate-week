import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { RecordForm } from "@/components/admin/RecordForm";
import type { AdminRow } from "@/lib/admin-schema";

export const Route = createFileRoute("/_authenticated/admin/jobs/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    prefill: typeof search.prefill === "string" ? search.prefill : undefined,
  }),
  component: NewJobPage,
});

function NewJobPage() {
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
      entityKey="jobs"
      id={null}
      prefill={initial}
      breadcrumb={<Breadcrumb label="New Job" />}
      onSaved={(id) => navigate({ to: "/admin/jobs/$id", params: { id } })}
      onDeleted={() => navigate({ to: "/admin/jobs" })}
      onCancel={() => navigate({ to: "/admin/jobs" })}
    />
  );
}

function Breadcrumb({ label }: { label: string }) {
  return (
    <nav className="text-sm text-muted-foreground">
      <Link to="/admin/jobs" className="hover:text-foreground">
        Jobs
      </Link>
      <span className="px-2">/</span>
      <span className="text-foreground">{label}</span>
    </nav>
  );
}
