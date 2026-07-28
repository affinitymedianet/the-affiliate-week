import { createFileRoute } from "@tanstack/react-router";

import { RecordManager } from "@/components/admin/RecordManager";

export const Route = createFileRoute("/_authenticated/admin/events")({
  component: () => <RecordManager entityKey="events" />,
});
