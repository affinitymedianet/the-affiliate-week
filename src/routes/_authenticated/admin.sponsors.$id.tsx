import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";

import { InboxDetail } from "@/components/admin/InboxDetail";
import { SPONSOR_COLUMNS } from "@/routes/_authenticated/admin.sponsors.index";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/admin/sponsors/$id")({
  component: SponsorDetailPage,
});

function SponsorDetailPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();

  return (
    <InboxDetail
      key={id}
      kind="sponsor_enquiries"
      id={id}
      columns={SPONSOR_COLUMNS}
      breadcrumb={
        <nav className="text-sm text-muted-foreground">
          <Link to="/admin/sponsors" className="hover:text-foreground">
            Sponsor enquiries
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">Detail</span>
        </nav>
      }
      onDeleted={() => navigate({ to: "/admin/sponsors" })}
      renderSiblingLink={(siblingId, label) => (
        <Button asChild size="sm" variant="outline">
          <Link to="/admin/sponsors/$id" params={{ id: siblingId }}>
            {label}
          </Link>
        </Button>
      )}
      extraActions={(row) => {
        const email = String(row.email ?? "");
        if (!email) return null;
        return (
          <Button asChild size="sm" variant="outline">
            <a href={`mailto:${email}`}>Reply by email</a>
          </Button>
        );
      }}
    />
  );
}
