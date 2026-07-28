import { createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

import { AdminShell } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Control room — The Affiliate Week" },
      { name: "robots", content: "noindex" },
      { name: "description", content: "Manage jobs, deals, events and enquiries." },
    ],
  }),
  component: () => (
    <>
      <AdminShell />
      <Toaster />
    </>
  ),
});
