import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { RecordForm } from "@/components/admin/RecordForm";
import type { AdminRow } from "@/lib/admin-schema";

export const Route = createFileRoute("/_authenticated/admin/issues/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    prefill: typeof search.prefill === "string" ? search.prefill : undefined,
  }),
  component: NewIssuePage,
});

function NewIssuePage() {
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
      entityKey="issues"
      id={null}
      prefill={initial}
      breadcrumb={<Breadcrumb label="New Issue" />}
      onSaved={(id) => navigate({ to: "/admin/issues/$id", params: { id } })}
      onDeleted={() => navigate({ to: "/admin/issues" })}
      onCancel={() => navigate({ to: "/admin/issues" })}
    />
  );
}

function Breadcrumb({ label }: { label: string }) {
  return (
    <nav className="text-sm text-muted-foreground">
      <Link to="/admin/issues" className="hover:text-foreground">
        Issues
      </Link>
      <span className="px-2">/</span>
      <span className="text-foreground">{label}</span>
    </nav>
  );
}
