import { createFileRoute } from "@tanstack/react-router";

import { InboxManager } from "@/components/admin/InboxManager";

export const Route = createFileRoute("/_authenticated/admin/sponsors")({
  component: () => (
    <InboxManager
      kind="sponsor_enquiries"
      title="Sponsor enquiries"
      description="Brands asking about newsletter placements. Track each conversation to a decision."
      columns={[
        { key: "company", label: "Company" },
        { key: "name", label: "Contact" },
        { key: "email", label: "Email" },
        { key: "budget", label: "Budget" },
        { key: "website", label: "Website" },
        { key: "message", label: "Message" },
      ]}
    />
  ),
});
