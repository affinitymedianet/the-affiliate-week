import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";

import { adminListInbox } from "@/lib/admin.functions";
import { downloadCsv, toCsv } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeading } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/subscribers")({
  component: SubscribersPage,
});

function SubscribersPage() {
  const [search, setSearch] = useState("");
  const { data: rows = [], isLoading } = useQuery({
    queryKey: ["admin", "inbox", "subscribers"],
    queryFn: () => adminListInbox({ data: { kind: "subscribers" } }),
  });

  const filtered = rows.filter((row) =>
    String(row.email ?? "").toLowerCase().includes(search.trim().toLowerCase()),
  );

  return (
    <div>
      <PageHeading
        title="Subscribers"
        description="Everyone who signed up through the site. Export the list to load it into your sending platform."
        actions={
          <Button
            variant="outline"
            disabled={rows.length === 0}
            onClick={() =>
              downloadCsv("subscribers.csv", toCsv(rows, ["email", "source", "created_at"]))
            }
          >
            <Download className="size-4" /> Export CSV
          </Button>
        }
      />

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by email"
        className="max-w-xs"
      />

      <p className="mt-4 text-sm text-muted-foreground">
        {filtered.length} of {rows.length} subscribers
      </p>

      <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[520px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">Source</th>
              <th className="p-3 font-semibold">Signed up</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-6 text-center text-muted-foreground">
                  No subscribers yet.
                </td>
              </tr>
            ) : (
              filtered.map((row) => (
                <tr key={String(row.id)}>
                  <td className="p-3">{String(row.email)}</td>
                  <td className="p-3 text-muted-foreground">{String(row.source ?? "website")}</td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(String(row.created_at)).toLocaleDateString("en-GB")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
