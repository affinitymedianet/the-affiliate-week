import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { adminStats } from "@/lib/admin.functions";
import { PageHeading } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminDashboard,
});

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 font-display text-3xl font-bold">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => adminStats(),
  });

  return (
    <div>
      <PageHeading
        title="Dashboard"
        description="Everything happening across the newsletter this week."
      />

      {isLoading || !data ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <Stat label="Subscribers" value={data.subscribers} />
            <Stat
              label="Jobs"
              value={data.jobs.published}
              hint={`${data.jobs.total} total, ${data.jobs.total - data.jobs.published} draft`}
            />
            <Stat
              label="Deals"
              value={data.deals.published}
              hint={`${data.deals.total} total, ${data.deals.total - data.deals.published} draft`}
            />
            <Stat
              label="Events"
              value={data.events.published}
              hint={`${data.events.total} total, ${data.events.total - data.events.published} draft`}
            />
            <Stat label="New submissions" value={data.openSubmissions} />
            <Stat label="New sponsor enquiries" value={data.openSponsors} />
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-lg border border-border p-5">
              <h2 className="font-display text-lg font-semibold">Quick actions</h2>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link to="/admin/jobs" className="text-primary hover:underline">
                    Post or import jobs →
                  </Link>
                </li>
                <li>
                  <Link to="/admin/deals" className="text-primary hover:underline">
                    Add a deal →
                  </Link>
                </li>
                <li>
                  <Link to="/admin/events" className="text-primary hover:underline">
                    Add an event →
                  </Link>
                </li>
                <li>
                  <Link to="/admin/submissions" className="text-primary hover:underline">
                    Review submissions →
                  </Link>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-border p-5">
              <h2 className="font-display text-lg font-semibold">Recent activity</h2>
              {data.recentActivity.length === 0 ? (
                <p className="mt-3 text-sm text-muted-foreground">No changes logged yet.</p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {data.recentActivity.map((entry) => (
                    <li key={entry.id}>
                      <span className="font-medium text-foreground">{entry.action}</span>{" "}
                      {entry.entity} · {entry.actor_email ?? "unknown"} ·{" "}
                      {new Date(entry.created_at).toLocaleString("en-GB")}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
