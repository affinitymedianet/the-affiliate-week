import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  adminDeleteSubscribers,
  adminListInbox,
  adminUpdateSubscriber,
} from "@/lib/admin.functions";
import { downloadCsv, toCsv } from "@/lib/csv";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { PageHeading } from "@/components/admin/AdminShell";
import { validateListSearch, type ListSearch } from "@/components/admin/RecordTable";
import { SITE_URL } from "@/lib/site";

export const Route = createFileRoute("/_authenticated/admin/subscribers")({
  validateSearch: validateListSearch,
  component: SubscribersPage,
});

const PER_PAGE = 50;
const STATUSES = ["active", "unsubscribed", "bounced"] as const;

function SubscribersPage() {
  const queryClient = useQueryClient();
  const params = Route.useSearch();
  const navigate = useNavigate();
  const setParams = (next: Partial<ListSearch>) =>
    navigate({ to: "/admin/subscribers", search: (prev: ListSearch) => ({ ...prev, ...next }) });

  const search = params.q;
  const statusFilter = params.status;
  const page = params.page;
  const setStatusFilter = (value: string) => setParams({ status: value, page: 1 });
  const setPage = (value: number) => setParams({ page: value });

  const [term, setTerm] = useState(search);
  useEffect(() => setTerm(search), [search]);
  useEffect(() => {
    if (term === search) return;
    const timer = setTimeout(() => setParams({ q: term, page: 1 }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const [selected, setSelected] = useState<string[]>([]);


  const listKey = ["admin", "inbox", "subscribers"];
  const { data: rows = [], isLoading } = useQuery({
    queryKey: listKey,
    queryFn: () => adminListInbox({ data: { kind: "subscribers" } }),
  });

  const refresh = () => {
    setSelected([]);
    queryClient.invalidateQueries({ queryKey: listKey });
  };

  const updateStatus = useMutation({
    mutationFn: (input: { id: string; status: string }) =>
      adminUpdateSubscriber({ data: input }),
    onSuccess: () => {
      toast.success("Subscriber updated");
      refresh();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const removeSubscribers = useMutation({
    mutationFn: (ids: string[]) => adminDeleteSubscribers({ data: { ids } }),
    onSuccess: () => {
      toast.success("Removed");
      refresh();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return rows.filter((row) => {
      const matchesSearch =
        !needle || String(row.email ?? "").toLowerCase().includes(needle);
      const matchesStatus =
        statusFilter === "all" || String(row.status ?? "active") === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rows, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * PER_PAGE;
  const pageRows = filtered.slice(start, start + PER_PAGE);

  const activeCount = rows.filter((r) => String(r.status ?? "active") === "active").length;

  return (
    <div>
      <PageHeading
        title="Subscribers"
        description="Everyone who signed up through the site. Export the list — including each reader's unsubscribe link — to load it into your sending platform."
        actions={
          <Button
            variant="outline"
            disabled={rows.length === 0}
            onClick={() =>
              downloadCsv(
                "subscribers.csv",
                toCsv(
                  rows.map((row) => ({
                    email: row.email,
                    status: row.status ?? "active",
                    source: row.source ?? "website",
                    created_at: row.created_at,
                    unsubscribe_url: `${SITE_URL}/unsubscribe?token=${String(row.unsubscribe_token ?? "")}`,
                  })),
                  ["email", "status", "source", "created_at", "unsubscribe_url"],
                ),
              )
            }
          >
            <Download className="size-4" /> Export CSV
          </Button>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by email"
          className="max-w-xs"
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <Button
          variant="destructive"
          size="sm"
          disabled={selected.length === 0}
          onClick={() => {
            if (confirm(`Permanently remove ${selected.length} subscriber(s)?`)) {
              removeSubscribers.mutate(selected);
            }
          }}
        >
          <Trash2 className="size-4" /> Remove ({selected.length})
        </Button>
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {filtered.length} of {rows.length} subscribers · {activeCount} active
      </p>

      <div className="mt-3 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[680px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="w-10 p-3">
                <Checkbox
                  checked={pageRows.length > 0 && selected.length === pageRows.length}
                  onCheckedChange={(checked) =>
                    setSelected(checked ? pageRows.map((r) => String(r.id)) : [])
                  }
                  aria-label="Select all"
                />
              </th>
              <th className="p-3 font-semibold">Email</th>
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Source</th>
              <th className="p-3 font-semibold">Signed up</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-muted-foreground">
                  No subscribers match that filter.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const id = String(row.id);
                return (
                  <tr key={id}>
                    <td className="p-3">
                      <Checkbox
                        checked={selected.includes(id)}
                        onCheckedChange={(checked) =>
                          setSelected((prev) =>
                            checked ? [...prev, id] : prev.filter((v) => v !== id),
                          )
                        }
                        aria-label="Select subscriber"
                      />
                    </td>
                    <td className="p-3">{String(row.email)}</td>
                    <td className="p-3">
                      <select
                        value={String(row.status ?? "active")}
                        onChange={(e) => updateStatus.mutate({ id, status: e.target.value })}
                        className="h-8 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-3 text-muted-foreground">{String(row.source ?? "website")}</td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(String(row.created_at)).toLocaleDateString("en-GB")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <div className="mt-4 flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {current} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={current >= totalPages}
            onClick={() => setPage(current + 1)}
          >
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
}
