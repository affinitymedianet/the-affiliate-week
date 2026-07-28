import { createFileRoute } from "@tanstack/react-router";

import { InboxManager } from "@/components/admin/InboxManager";

export const Route = createFileRoute("/_authenticated/admin/submissions")({
  component: () => (
    <InboxManager
      kind="submissions"
      title="Submissions"
      description="Events, jobs and offers sent in by readers. Accept one and add it to the right board."
      columns={[
        { key: "title", label: "Title" },
        { key: "kind", label: "Type" },
        { key: "organisation", label: "Organisation" },
        { key: "location", label: "Location" },
        { key: "happens_on", label: "Date" },
        { key: "url", label: "URL" },
        { key: "details", label: "Details" },
        { key: "submitter_name", label: "Submitted by" },
        { key: "submitter_email", label: "Email" },
      ]}
    />
  ),
});
