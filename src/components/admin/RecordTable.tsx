import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import { ENTITIES, type AdminRow, type EntityKey } from "@/lib/admin-schema";
import {
  adminBulkInsert,
  adminDelete,
  adminList,
  adminSetPublished,
} from "@/lib/admin.functions";
import { downloadCsv, parseCsv, toCsv } from "@/lib/csv";
import { PageHeading } from "@/components/admin/AdminShell";
import { StatusBadge, recordStatus } from "@/components/admin/record-fields";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

export type ListSearch = { q: string; status: string; page: number };

export const LIST_SEARCH_DEFAULTS: ListSearch = { q: "", status: "all", page: 1 };

export function validateListSearch(search: Record<string, unknown>): ListSearch {
  const page = Number(search.page);
  return {
    q: typeof search.q === "string" ? search.q : "",
    status: typeof search.status === "string" ? search.status : "all",
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

const PER_PAGE = 25;

export function RecordTable({
  entityKey,
  search,
  onSearchChange,
  newButton,
  renderEditLink,
}: {
  entityKey: EntityKey;
  search: ListSearch;
  onSearchChange: (next: Partial<ListSearch>) => void;
  newButton: React.ReactNode;
  renderEditLink: (id: string, label: string) => React.ReactNode;
}) {
  const entity = ENTITIES[entityKey];
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [selected, setSelected] = useState<string[]>([]);
  const [term, setTerm] = useState(search.q);
  const [importPreview, setImportPreview] = useState<AdminRow[] | null>(null);

  useEffect(() => setTerm(search.q), [search.q]);

  useEffect(() => {
    if (term === search.q) return;
    const timer = setTimeout(() => onSearchChange({ q: term, page: 1 }), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [term]);

  const listKey = ["admin", entityKey];
  const { data: rows = [], isLoading } = useQuery({
    queryKey: listKey,
    queryFn: () => adminList({ data: { entity: entityKey } }),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: listKey });

  const publishMutation = useMutation({
    mutationFn: (input: { ids: string[]; published: boolean }) =>
      adminSetPublished({ data: { entity: entityKey, ...input } }),
    onSuccess: () => {
      toast.success("Visibility updated");
      setSelected([]);
      refresh();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => adminDelete({ data: { entity: entityKey, ids } }),
    onSuccess: () => {
      toast.success("Deleted");
      setSelected([]);
      refresh();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const importMutation = useMutation({
    mutationFn: (bulk: AdminRow[]) => adminBulkInsert({ data: { entity: entityKey, rows: bulk } }),
    onSuccess: (result) => {
      toast.success(`Imported ${result.inserted} ${entity.plural.toLowerCase()}`);
      setImportPreview(null);
      refresh();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = useMemo(() => {
    const needle = search.q.trim().toLowerCase();
    return rows.filter((row) => {
      if (search.status !== "all" && recordStatus(row) !== search.status) return false;
      if (!needle) return true;
      return Object.values(row).some((value) =>
        String(value ?? "").toLowerCase().includes(needle),
      );
    });
  }, [rows, search.q, search.status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const page = Math.min(Math.max(1, search.page), totalPages);
  const start = (page - 1) * PER_PAGE;
  const pageRows = filtered.slice(start, start + PER_PAGE);
  const tableFields = entity.fields.filter((f) => !f.hideInTable).slice(0, 5);

  function onFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => {
      const parsed = parseCsv(String(reader.result ?? ""));
      if (parsed.length === 0) {
        toast.error("No rows found in that CSV");
        return;
      }
      setImportPreview(parsed as AdminRow[]);
    };
    reader.readAsText(file);
  }

  return (
    <div>
      <PageHeading
        title={entity.plural}
        description={`Create, edit, bulk-import and publish ${entity.plural.toLowerCase()} shown on the public site.`}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                downloadCsv(
                  `${entityKey}-template.csv`,
                  toCsv([Object.fromEntries(entity.fields.map((f) => [f.name, ""]))]),
                )
              }
            >
              <Download className="size-4" /> CSV template
            </Button>
            <Button variant="outline" onClick={() => fileRef.current?.click()}>
              <Upload className="size-4" /> Bulk import
            </Button>
            {newButton}
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFile(file);
                e.target.value = "";
              }}
            />
          </>
        }
      />

      {importPreview ? (
        <div className="mb-4 rounded-lg border border-border bg-muted/40 p-4">
          <p className="text-sm font-semibold">
            {importPreview.length} row(s) ready to import
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Columns: {Object.keys(importPreview[0] ?? {}).join(", ")}
          </p>
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              disabled={importMutation.isPending}
              onClick={() => importMutation.mutate(importPreview)}
            >
              Import {importPreview.length} rows
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setImportPreview(null)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={`Search ${entity.plural.toLowerCase()}`}
          className="max-w-xs"
        />
        <select
          value={search.status}
          onChange={(e) => onSearchChange({ status: e.target.value, page: 1 })}
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">All statuses</option>
          <option value="live">Live</option>
          <option value="scheduled">Scheduled</option>
          <option value="draft">Draft</option>
        </select>
        <Button
          variant="outline"
          size="sm"
          disabled={selected.length === 0}
          onClick={() => publishMutation.mutate({ ids: selected, published: true })}
        >
          Publish ({selected.length})
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={selected.length === 0}
          onClick={() => publishMutation.mutate({ ids: selected, published: false })}
        >
          Unpublish
        </Button>
        <Button
          variant="destructive"
          size="sm"
          disabled={selected.length === 0}
          onClick={() => {
            if (confirm(`Delete ${selected.length} record(s)? This cannot be undone.`)) {
              deleteMutation.mutate(selected);
            }
          }}
        >
          <Trash2 className="size-4" /> Delete
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => downloadCsv(`${entityKey}-export.csv`, toCsv(rows))}
          disabled={rows.length === 0}
        >
          <Download className="size-4" /> Export all
        </Button>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-muted/60 text-left">
            <tr>
              <th className="w-10 p-3">
                <Checkbox
                  checked={pageRows.length > 0 && pageRows.every((r) => selected.includes(String(r.id)))}
                  onCheckedChange={(checked) =>
                    setSelected(checked ? pageRows.map((r) => String(r.id)) : [])
                  }
                  aria-label="Select all"
                />
              </th>
              {tableFields.map((field) => (
                <th key={field.name} className="p-3 font-semibold">
                  {field.label}
                </th>
              ))}
              <th className="p-3 font-semibold">Status</th>
              <th className="w-24 p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={tableFields.length + 3} className="p-6 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : pageRows.length === 0 ? (
              <tr>
                <td colSpan={tableFields.length + 3} className="p-6 text-center text-muted-foreground">
                  Nothing here yet.
                </td>
              </tr>
            ) : (
              pageRows.map((row) => {
                const id = String(row.id);
                return (
                  <tr key={id} className="hover:bg-muted/40">
                    <td className="p-3">
                      <Checkbox
                        checked={selected.includes(id)}
                        onCheckedChange={(checked) =>
                          setSelected((prev) =>
                            checked ? [...prev, id] : prev.filter((v) => v !== id),
                          )
                        }
                        aria-label="Select row"
                      />
                    </td>
                    {tableFields.map((field) => (
                      <td key={field.name} className="max-w-[240px] truncate p-3">
                        {field.type === "boolean"
                          ? row[field.name]
                            ? "Yes"
                            : "No"
                          : String(row[field.name] ?? "—")}
                      </td>
                    ))}
                    <td className="p-3">
                      <StatusBadge row={row} />
                    </td>
                    <td className="p-3 text-right">{renderEditLink(id, "Edit")}</td>
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
          <div className="flex flex-wrap items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onSearchChange({ page: page - 1 })}
            >
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, index, list) => (
                <span key={p} className="flex items-center gap-1">
                  {index > 0 && p - list[index - 1] > 1 ? (
                    <span className="px-1 text-muted-foreground">…</span>
                  ) : null}
                  <Button
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onSearchChange({ page: p })}
                  >
                    {p}
                  </Button>
                </span>
              ))}
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
