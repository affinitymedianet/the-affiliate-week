import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { InboxDetail } from "@/components/admin/InboxDetail";
import { SUBMISSION_COLUMNS } from "@/routes/_authenticated/admin.submissions.index";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/submissions/$id")({
  component: SubmissionDetailPage,
});

function SubmissionDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  return (
    <InboxDetail
      key={id}
      kind="submissions"
      id={id}
      columns={SUBMISSION_COLUMNS}
      breadcrumb={
        <nav className="text-sm text-muted-foreground">
          <Link to="/admin/submissions" className="hover:text-foreground">
            Submissions
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">Detail</span>
        </nav>
      }
      onDeleted={() => navigate({ to: "/admin/submissions" })}
      renderSiblingLink={(siblingId, label) => (
        <Button asChild size="sm" variant="outline">
          <Link to="/admin/submissions/$id" params={{ id: siblingId }}>
            {label}
          </Link>
        </Button>
      )}
      extraActions={(row) => {
        const kind = String(row.kind ?? "");
        if (kind === "job") {
          const prefill = JSON.stringify({
            title: String(row.title ?? ""),
            summary: String(row.details ?? ""),
            description: String(row.details ?? ""),
            company: String(row.organisation ?? ""),
            location: String(row.location ?? ""),
            apply_url: String(row.url ?? ""),
            published: false,
          });
          return (
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/jobs/new" search={{ prefill }}>
                Create job from this
              </Link>
            </Button>
          );
        }
        if (kind === "event") {
          const prefill = JSON.stringify({
            name: String(row.title ?? ""),
            description: String(row.details ?? ""),
            location: String(row.location ?? ""),
            event_url: String(row.url ?? ""),
            published: false,
          });
          return (
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/events/new" search={{ prefill }}>
                Create event from this
              </Link>
            </Button>
          );
        }
        if (kind === "offer") {
          const prefill = JSON.stringify({
            title: String(row.title ?? ""),
            summary: String(row.details ?? ""),
            description: String(row.details ?? ""),
            vendor: String(row.organisation ?? ""),
            deal_url: String(row.url ?? ""),
            published: false,
          });
          return (
            <Button asChild size="sm" variant="outline">
              <Link to="/admin/deals/new" search={{ prefill }}>
                Create deal from this
              </Link>
            </Button>
          );
        }
        return null;
      }}
    />
  );
}
