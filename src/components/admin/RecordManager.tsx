import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Download, Loader2, Pencil, Plus, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";

import {
  ENTITIES,
  emptyRecord,
  slugify,
  type AdminRow,
  type EntityKey,
  type FieldDef,
} from "@/lib/admin-schema";
import {
  adminBulkInsert,
  adminDelete,
  adminList,
  adminSave,
  adminSetPublished,
} from "@/lib/admin.functions";
import { downloadCsv, parseCsv, toCsv } from "@/lib/csv";
import { AssetUpload } from "@/components/admin/AssetUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { PageHeading } from "@/components/admin/AdminShell";

function toLocalInput(value: string | null): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FieldDef;
  value: string | number | boolean | null;
  onChange: (value: string | boolean) => void;
}) {
  const id = `field-${field.name}`;
  if (field.type === "boolean") {
    return (
      <div className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
        <Label htmlFor={id}>{field.label}</Label>
        <Switch id={id} checked={!!value} onCheckedChange={onChange} />
      </div>
    );
  }
  return (
    <div>
      <Label htmlFor={id}>
        {field.label}
        {field.required ? <span className="text-destructive"> *</span> : null}
      </Label>
      {field.type === "textarea" ? (
        <Textarea
          id={id}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="mt-1.5"
          required={field.required}
        />
      ) : field.type === "select" ? (
        <select
          id={id}
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value)}
          className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : field.type === "json" ? (
        <Textarea
          id={id}
          value={
            typeof value === "string" ? value : JSON.stringify(value ?? [], null, 2)
          }
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          className="mt-1.5 font-mono text-xs"
        />
      ) : field.type === "image" ? (
        <AssetUpload
          id={id}
          value={(value as string) ?? ""}
          onChange={(next: string) => onChange(next)}
        />
      ) : (
        <Input
          id={id}
          type={
            field.type === "date"
              ? "date"
              : field.type === "datetime"
                ? "datetime-local"
                : field.type === "number"
                  ? "number"
                  : field.type === "url"
                    ? "url"
                    : "text"
          }
          value={
            field.type === "datetime" ? toLocalInput(value as string | null) : ((value as string) ?? "")
          }
          onChange={(e) =>
            onChange(
              field.type === "datetime" && e.target.value
                ? new Date(e.target.value).toISOString()
                : e.target.value,
            )
          }
          className="mt-1.5"
          required={field.required}
        />
      )}
      {field.help ? <p className="mt-1 text-xs text-muted-foreground">{field.help}</p> : null}
    </div>
  );
}

function StatusBadge({ row }: { row: AdminRow }) {
  const scheduled =
    !!row.publish_at && new Date(String(row.publish_at)).getTime() > Date.now();
  if (!row.published) {
    return (
      <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
        Draft
      </span>
    );
  }
  if (scheduled) {
    return (
      <span
        className="rounded bg-signal/15 px-2 py-0.5 text-xs font-semibold text-signal"
        title={new Date(String(row.publish_at)).toLocaleString("en-GB")}
      >
        Scheduled
      </span>
    );
  }
  return (
    <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
      Live
    </span>
  );
}

export function RecordManager({ entityKey }: { entityKey: EntityKey }) {
  const entity = ENTITIES[entityKey];
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState<AdminRow | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [importPreview, setImportPreview] = useState<AdminRow[] | null>(null);

  const listKey = ["admin", entityKey];
  const { data: rows = [], isLoading } = useQuery({
    queryKey: listKey,
    queryFn: () => adminList({ data: { entity: entityKey } }),
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: listKey });

  const saveMutation = useMutation({
    mutationFn: (input: { id: string | null; values: AdminRow }) =>
      adminSave({ data: { entity: entityKey, id: input.id, values: input.values } }),
    onSuccess: () => {
      toast.success(`${entity.singular} saved`);
      setEditing(null);
      refresh();
    },
    onError: (err: Error) => toast.error(err.message),
  });

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
    mutationFn: (bulk: AdminRow[]) =>
      adminBulkInsert({ data: { entity: entityKey, rows: bulk } }),
    onSuccess: (result) => {
      toast.success(`Imported ${result.inserted} ${entity.plural.toLowerCase()}`);
      setImportPreview(null);
      refresh();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      Object.values(row).some((value) => String(value ?? "").toLowerCase().includes(needle)),
    );
  }, [rows, search]);

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
            <Button onClick={() => setEditing(emptyRecord(entity))}>
              <Plus className="size-4" /> New {entity.singular}
            </Button>
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

      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Search ${entity.plural.toLowerCase()}`}
          className="max-w-xs"
        />
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
                  checked={filtered.length > 0 && selected.length === filtered.length}
                  onCheckedChange={(checked) =>
                    setSelected(checked ? filtered.map((r) => String(r.id)) : [])
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
              <th className="w-16 p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={tableFields.length + 3} className="p-6 text-center text-muted-foreground">
                  Loading…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={tableFields.length + 3} className="p-6 text-center text-muted-foreground">
                  Nothing here yet.
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
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
                    <td className="p-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setEditing(row)}>
                        <Pencil className="size-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing?.id ? `Edit ${entity.singular}` : `New ${entity.singular}`}
            </DialogTitle>
            <DialogDescription>
              Changes go live on the public site as soon as the record is published.
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const values: AdminRow = {};
                for (const field of entity.fields) values[field.name] = editing[field.name] ?? null;
                if (entityKey === "events" && !values.slug && values.name) {
                  values.slug = slugify(String(values.name));
                }
                if (entityKey === "issues" && !values.slug && values.title) {
                  values.slug = slugify(String(values.title));
                }
                saveMutation.mutate({ id: editing.id ? String(editing.id) : null, values });
              }}
              className="space-y-4"
            >
              {entity.fields.map((field) => (
                <FieldInput
                  key={field.name}
                  field={field}
                  value={editing[field.name] ?? ""}
                  onChange={(value) => setEditing({ ...editing, [field.name]: value })}
                />
              ))}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEditing(null)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                  Save
                </Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={!!importPreview} onOpenChange={(open) => !open && setImportPreview(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import {importPreview?.length ?? 0} rows</DialogTitle>
            <DialogDescription>
              Columns are matched by header name. Use the CSV template to get the exact headers.
              Unknown columns are ignored.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-48 overflow-auto rounded-md border border-border p-3 text-xs">
            {importPreview?.slice(0, 8).map((row, index) => (
              <p key={index} className="truncate">
                {String(row[entity.titleField] ?? "(no title)")}
              </p>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportPreview(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => importPreview && importMutation.mutate(importPreview)}
              disabled={importMutation.isPending}
            >
              {importMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
              Import
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
