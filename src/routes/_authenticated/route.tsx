import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

import { currentUser } from "@/integrations/firebase/auth";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = await currentUser();
    if (!user) throw redirect({ to: "/a6b8" });
    return { user };
  },
  component: () => <Outlet />,
});
