import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Download } from "lucide-react";

import { adminListInbox, adminUpdateInboxItem } from "@/lib/admin.functions";
import { downloadCsv, toCsv } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PageHeading } from "@/components/admin/AdminShell";

export const STATUSES = ["new", "in review", "accepted", "declined", "archived"] as const;

export function InboxManager({
  kind,
  title,
  description,
  columns,
}: {
  kind: "submissions" | "sponsor_enquiries";
  title: string;
  description: string;
  columns: { key: string; label: string }[];
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [openId, setOpenId] = useState<string | null>(null);

  const listKey = ["admin", "inbox", kind];
  const { data: rows = [], isLoading } = useQuery({
    queryKey: listKey,
    queryFn: () => adminListInbox({ data: { kind } }),
  });

  const update = useMutation({
    mutationFn: (input: { id: string; status?: string; admin_notes?: string }) =>
      adminUpdateInboxItem({ data: { kind, ...input } }),
    onSuccess: () => {
      toast.success("Updated");
      queryClient.invalidateQueries({ queryKey: listKey });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = rows.filter((row) => {
    if (statusFilter !== "all" && String(row.status ?? "new") !== statusFilter) return false;
    const needle = search.trim().toLowerCase();
    if (!needle) return true;
    return Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(needle));
  });

  return (
    <div>
      <PageHeading
        title={title}
        description={description}
        actions={
          <Button
            variant="outline"
            disabled={rows.length === 0}
            onClick={() => downloadCsv(`${kind}.csv`, toCsv(rows))}
          >
            <Download className="size-4" /> Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search"
          className="max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nothing here yet.</p>
        ) : (
          filtered.map((row) => {
            const id = String(row.id);
            const open = openId === id;
            return (
              <div key={id} className="rounded-lg border border-border">
                <button
                  type="button"
                  onClick={() => setOpenId(open ? null : id)}
                  className="flex w-full flex-wrap items-center justify-between gap-3 p-4 text-left"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {String(row[columns[0].key] ?? "Untitled")}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {columns
                        .slice(1, 4)
                        .map((c) => String(row[c.key] ?? ""))
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                  </div>
                  <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold uppercase">
                    {String(row.status ?? "new")}
                  </span>
                </button>

                {open ? (
                  <div className="border-t border-border p-4">
                    <dl className="grid gap-3 sm:grid-cols-2">
                      {columns.map((c) => (
                        <div key={c.key}>
                          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                            {c.label}
                          </dt>
                          <dd className="mt-0.5 break-words text-sm">
                            {String(row[c.key] ?? "—")}
                          </dd>
                        </div>
                      ))}
                      <div>
                        <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                          Received
                        </dt>
                        <dd className="mt-0.5 text-sm">
                          {new Date(String(row.created_at)).toLocaleString("en-GB")}
                        </dd>
                      </div>
                    </dl>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {STATUSES.map((s) => (
                        <Button
                          key={s}
                          size="sm"
                          variant={String(row.status ?? "new") === s ? "default" : "outline"}
                          onClick={() => update.mutate({ id, status: s })}
                        >
                          {s}
                        </Button>
                      ))}
                    </div>

                    <Textarea
                      defaultValue={String(row.admin_notes ?? "")}
                      placeholder="Internal notes"
                      rows={3}
                      className="mt-3"
                      onBlur={(e) => {
                        if (e.target.value !== String(row.admin_notes ?? "")) {
                          update.mutate({ id, admin_notes: e.target.value });
                        }
                      }}
                    />
                  </div>
                ) : null}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
