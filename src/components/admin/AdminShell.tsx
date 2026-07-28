import { useEffect, useState } from "react";
import { Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  CalendarDays,
  Inbox,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  Settings,
  Tag,
  Users,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { claimFirstAdmin, getMyAccess } from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import logoAsset from "@/assets/taw-logo.png.asset.json";

type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  exact?: boolean;
  adminOnly?: boolean;
};

const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/jobs", label: "Jobs", icon: Briefcase },
  { to: "/admin/deals", label: "Deals", icon: Tag },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/submissions", label: "Submissions", icon: Inbox },
  { to: "/admin/sponsors", label: "Sponsor enquiries", icon: Mail },
  { to: "/admin/subscribers", label: "Subscribers", icon: Users },
  { to: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
  { to: "/admin/team", label: "Team & roles", icon: Users, adminOnly: true },
];

export function AdminShell() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const { data: access, isLoading, error } = useQuery({
    queryKey: ["admin", "access"],
    queryFn: () => getMyAccess(),
    retry: false,
  });

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  async function signOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading the control room…</p>
      </div>
    );
  }

  if (error || !access?.isStaff) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5">
        <div className="max-w-md text-center">
          <h1 className="font-display text-2xl font-bold">No access yet</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Your account is signed in but has no editor or admin role. Ask an existing admin to
            grant you access from Team &amp; roles.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              onClick={async () => {
                try {
                  await claimFirstAdmin();
                  await queryClient.invalidateQueries({ queryKey: ["admin", "access"] });
                } catch (err) {
                  alert(err instanceof Error ? err.message : "Could not claim access");
                }
              }}
            >
              Claim owner access
            </Button>
            <Button variant="outline" onClick={signOut}>
              Sign out
            </Button>
            <Button asChild variant="ghost">
              <Link to="/">Back to the site</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const items = NAV.filter((item) => !item.adminOnly || access.isAdmin);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="flex h-16 items-center justify-between px-5 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              className="-ml-1 inline-flex size-10 items-center justify-center rounded-md hover:bg-muted lg:hidden"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
            <Link to="/" className="flex items-center">
              <img src={logoAsset.url} alt="The Affiliate Week" className="h-8 w-auto" />
            </Link>
            <span className="hidden rounded bg-primary px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-primary-foreground sm:inline">
              Control room
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              {access.email} · {access.isAdmin ? "admin" : "editor"}
            </span>
            <Button size="sm" variant="outline" onClick={signOut}>
              <LogOut className="size-4" /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={cn(
            "fixed inset-x-0 top-16 z-30 border-b border-border bg-background p-3 lg:sticky lg:top-16 lg:block lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:h-[calc(100vh-4rem)] lg:overflow-y-auto",
            open ? "block" : "hidden",
          )}
        >
          <nav className="space-y-1">
            {items.map((item) => {
              const active = item.exact
                ? pathname === item.to
                : pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to as never}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted",
                  )}
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="min-w-0 flex-1 px-5 py-8 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeading({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
