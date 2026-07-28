import { createFileRoute } from "@tanstack/react-router";

import { RecordManager } from "@/components/admin/RecordManager";

export const Route = createFileRoute("/_authenticated/admin/jobs")({
  component: () => <RecordManager entityKey="jobs" />,
});
