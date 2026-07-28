import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { RecordForm } from "@/components/admin/RecordForm";
import type { AdminRow } from "@/lib/admin-schema";

export const Route = createFileRoute("/_authenticated/admin/deals/new")({
  validateSearch: (search: Record<string, unknown>) => ({
    prefill: typeof search.prefill === "string" ? search.prefill : undefined,
  }),
  component: NewDealPage,
});

function NewDealPage() {
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
      entityKey="deals"
      id={null}
      prefill={initial}
      breadcrumb={<Breadcrumb label="New Deal" />}
      onSaved={(id) => navigate({ to: "/admin/deals/$id", params: { id } })}
      onDeleted={() => navigate({ to: "/admin/deals" })}
      onCancel={() => navigate({ to: "/admin/deals" })}
    />
  );
}

function Breadcrumb({ label }: { label: string }) {
  return (
    <nav className="text-sm text-muted-foreground">
      <Link to="/admin/deals" className="hover:text-foreground">
        Deals
      </Link>
      <span className="px-2">/</span>
      <span className="text-foreground">{label}</span>
    </nav>
  );
}
