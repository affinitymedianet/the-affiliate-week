import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  ENTITIES,
  emptyRecord,
  slugify,
  type AdminRow,
  type EntityKey,
} from "@/lib/admin-schema";
import {
  adminDelete,
  adminGetRecord,
  adminSave,
  getMyAccess,
} from "@/lib/admin.functions";
import { FieldInput, StatusBadge } from "@/components/admin/record-fields";
import { Button } from "@/components/ui/button";

export function RecordForm({
  entityKey,
  id,
  prefill,
  breadcrumb,
  onSaved,
  onDeleted,
  onCancel,
}: {
  entityKey: EntityKey;
  id: string | null;
  prefill?: AdminRow;
  breadcrumb: React.ReactNode;
  onSaved: (id: string) => void;
  onDeleted: () => void;
  onCancel: () => void;
}) {
  const entity = ENTITIES[entityKey];
  const queryClient = useQueryClient();
  const [values, setValues] = useState<AdminRow | null>(null);
  const [dirty, setDirty] = useState(false);

  const { data: access } = useQuery({
    queryKey: ["admin", "access"],
    queryFn: () => getMyAccess(),
    retry: false,
  });

  const { data: record, isLoading } = useQuery({
    queryKey: ["admin", entityKey, "record", id],
    queryFn: () => adminGetRecord({ data: { entity: entityKey, id: id as string } }),
    enabled: !!id,
  });

  useEffect(() => {
    if (id) {
      if (record) setValues({ ...record });
    } else {
      setValues({ ...emptyRecord(entity), ...(prefill ?? {}) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, record]);

  useEffect(() => {
    if (!dirty) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", entityKey] });
  };

  const saveMutation = useMutation({
    mutationFn: (input: { values: AdminRow }) =>
      adminSave({ data: { entity: entityKey, id, values: input.values } }),
    onSuccess: (result) => {
      toast.success(`${entity.singular} saved`);
      setDirty(false);
      invalidate();
      onSaved(result.id);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: () => adminDelete({ data: { entity: entityKey, ids: [id as string] } }),
    onSuccess: () => {
      toast.success("Deleted");
      setDirty(false);
      invalidate();
      onDeleted();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const title = useMemo(() => {
    if (!id) return `New ${entity.singular.toLowerCase()}`;
    const label = values?.[entity.titleField];
    return label ? String(label) : `Edit ${entity.singular.toLowerCase()}`;
  }, [id, values, entity]);

  function collect(publish?: boolean): AdminRow {
    const payload: AdminRow = {};
    for (const field of entity.fields) payload[field.name] = values?.[field.name] ?? null;
    if (entityKey === "events" && !payload.slug && payload.name) {
      payload.slug = slugify(String(payload.name));
    }
    if (entityKey === "issues" && !payload.slug && payload.title) {
      payload.slug = slugify(String(payload.title));
    }
    if (publish) payload.published = true;
    return payload;
  }

  if (isLoading || !values) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (id && !record) {
    return (
      <div>
        {breadcrumb}
        <p className="mt-4 text-sm text-muted-foreground">That record no longer exists.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        saveMutation.mutate({ values: collect() });
      }}
    >
      {breadcrumb}

      <div className="mb-6 mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Changes go live on the public site as soon as the record is published.
          </p>
        </div>
        {id ? <StatusBadge row={values} /> : null}
      </div>

      <div className="grid gap-4 rounded-lg border border-border p-5 md:grid-cols-2">
        {entity.fields.map((field) => (
          <div
            key={field.name}
            className={
              field.type === "textarea" || field.type === "json" || field.type === "image"
                ? "md:col-span-2"
                : ""
            }
          >
            <FieldInput
              field={field}
              value={values[field.name] ?? null}
              onChange={(next) => {
                setDirty(true);
                setValues((prev) => ({ ...(prev ?? {}), [field.name]: next }));
              }}
            />
          </div>
        ))}
      </div>

      <div className="sticky bottom-0 mt-4 flex flex-wrap items-center gap-2 border-t border-border bg-background/95 py-4 backdrop-blur">
        <Button type="submit" disabled={saveMutation.isPending}>
          {saveMutation.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save
        </Button>
        {!values.published ? (
          <Button
            type="button"
            variant="outline"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate({ values: collect(true) })}
          >
            Save &amp; publish
          </Button>
        ) : null}
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            if (dirty && !confirm("Discard unsaved changes?")) return;
            onCancel();
          }}
        >
          Cancel
        </Button>
        {id && access?.isAdmin ? (
          <Button
            type="button"
            variant="destructive"
            className="ml-auto"
            disabled={deleteMutation.isPending}
            onClick={() => {
              if (confirm("Delete this record? This cannot be undone.")) deleteMutation.mutate();
            }}
          >
            <Trash2 className="size-4" /> Delete
          </Button>
        ) : null}
      </div>
    </form>
  );
}
