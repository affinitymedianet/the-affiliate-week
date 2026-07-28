import { createFileRoute } from "@tanstack/react-router";

import { RecordManager } from "@/components/admin/RecordManager";

export const Route = createFileRoute("/_authenticated/admin/deals")({
  component: () => <RecordManager entityKey="deals" />,
});
