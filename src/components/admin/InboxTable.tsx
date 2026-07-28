import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";

import { adminListInbox } from "@/lib/admin.functions";
import { downloadCsv, toCsv } from "@/lib/csv";
import { PageHeading } from "@/components/admin/AdminShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ListSearch } from "@/components/admin/RecordTable";

export const STATUSES = ["new", "in review", "accepted", "declined", "archived"] as const;

const PER_PAGE = 25;

export type InboxKind = "submissions" | "sponsor_enquiries";

export function useInboxRows(kind: InboxKind) {
  return useQuery({
    queryKey: ["admin", "inbox", kind],
    queryFn: () => adminListInbox({ data: { kind } }),
  });
}

export function InboxTable({
  kind,
  title,
  description,
  columns,
  search,
  onSearchChange,
  renderOpenLink,
}: {
  kind: InboxKind;
  title: string;
  description: string;
  columns: { key: string; label: string }[];
  search: ListSearch;
  onSearchChange: (next: Partial<ListSearch>) => void;
  renderOpenLink: (id: string, label: string) => React.ReactNode;
}) {
  const { data: rows = [], isLoading } = useInboxRows(kind);
  const [term, setTerm] = useState(search.q);

  useEffect(() => setTerm(search.q), [search.q]);
  useEffect(() => {
    if (term === search.q) return;
    const timer = setTimeout(() => onSearchChange({ q: term, page: 1 }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const filtered = useMemo(() => {
    const needle = search.q.trim().toLowerCase();
    return rows.filter((row) => {
      if (search.status !== "all" && String(row.status ?? "new") !== search.status) return false;
      if (!needle) return true;
      return Object.values(row).some((v) => String(v ?? "").toLowerCase().includes(needle));
    });
  }, [rows, search.q, search.status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(Math.max(1, search.page), totalPages);
  const start = (page - 1) * PER_PAGE;
  const pageRows = filtered.slice(start, start + PER_PAGE);
  const tableColumns = columns.slice(0, 4);

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
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search"
          className="max-w-xs"
        />
        <select
          value={search.status}
          onChange={(e) => onSearchChange({ status: e.target.value, page: 1 })}
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

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              {tableColumns.map((column) => (
                <th key={column.key} className="p-3 font-semibold">
                  {column.label}
                </th>
              ))}
              <th className="p-3 font-semibold">Status</th>
              <th className="p-3 font-semibold">Received</th>
              <th className="w-24 p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={tableColumns.length + 3} className="p-6 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={tableColumns.length + 3} className="p-6 text-center text-muted-foreground">
                  Nothing here yet.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const id = String(row.id);
                return (
                  <tr key={id} className="hover:bg-muted/40">
                    {tableColumns.map((column) => (
                      <td key={column.key} className="max-w-[240px] truncate p-3">
                        {String(row[column.key] ?? "—")}
                      </td>
                    ))}
                    <td className="p-3">
                      <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold uppercase">
                        {String(row.status ?? "new")}
                      </span>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {new Date(String(row.created_at)).toLocaleDateString("en-GB")}
                    </td>
                    <td className="p-3 text-right">{renderOpenLink(id, "Open")}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {filtered.length === 0
            ? "No records"
            : `Showing ${start + 1}–${Math.min(start + PER_PAGE, filtered.length)} of ${filtered.length}`}
        </p>
        {totalPages > 1 ? (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onSearchChange({ page: page - 1 })}
            >
              Previous
            </Button>
            <span className="px-2 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onSearchChange({ page: page + 1 })}
            >
              Next
            </Button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
