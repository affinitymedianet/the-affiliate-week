import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  adminDeleteInboxItem,
  adminGetInboxItem,
  adminUpdateInboxItem,
  getMyAccess,
} from "@/lib/admin.functions";
import { STATUSES, useInboxRows, type InboxKind } from "@/components/admin/InboxTable";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function InboxDetail({
  kind,
  id,
  columns,
  breadcrumb,
  onDeleted,
  renderSiblingLink,
  extraActions,
}: {
  kind: InboxKind;
  id: string;
  columns: { key: string; label: string }[];
  breadcrumb: React.ReactNode;
  onDeleted: () => void;
  renderSiblingLink: (id: string, label: string) => React.ReactNode;
  extraActions?: (row: Record<string, unknown>) => React.ReactNode;
}) {
  const queryClient = useQueryClient();
  const [notes, setNotes] = useState("");

  const { data: access } = useQuery({
    queryKey: ["admin", "access"],
    queryFn: () => getMyAccess(),
    retry: false,
  });

  const { data: row, isLoading } = useQuery({
    queryKey: ["admin", "inbox", kind, id],
    queryFn: () => adminGetInboxItem({ data: { kind, id } }),
  });

  const { data: allRows = [] } = useInboxRows(kind);
  const index = allRows.findIndex((r) => String(r.id) === id);
  const previous = index > 0 ? String(allRows[index - 1].id) : null;
  const next = index >= 0 && index < allRows.length - 1 ? String(allRows[index + 1].id) : null;

  useEffect(() => {
    if (row) setNotes(String(row.admin_notes ?? ""));
  }, [row]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["admin", "inbox", kind] });
  };

  const update = useMutation({
    mutationFn: (input: { status?: string; admin_notes?: string }) =>
      adminUpdateInboxItem({ data: { kind, id, ...input } }),
    onSuccess: () => {
      toast.success("Updated");
      invalidate();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const remove = useMutation({
    mutationFn: () => adminDeleteInboxItem({ data: { kind, id } }),
    onSuccess: () => {
      toast.success("Deleted");
      invalidate();
      onDeleted();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!row) {
    return (
      <div>
        {breadcrumb}
        <p className="mt-4 text-sm text-muted-foreground">That enquiry no longer exists.</p>
      </div>
    );
  }

  return (
    <div>
      {breadcrumb}

      <div className="mb-6 mt-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">
            {String(row[columns[0].key] ?? "Untitled")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Received {new Date(String(row.created_at)).toLocaleString("en-GB")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {previous ? renderSiblingLink(previous, "← Newer") : null}
          {next ? renderSiblingLink(next, "Older →") : null}
        </div>
      </div>

      <dl className="grid gap-4 rounded-lg border border-border p-5 sm:grid-cols-2">
        {columns.map((column) => (
          <div key={column.key}>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">
              {column.label}
            </dt>
            <dd className="mt-0.5 break-words text-sm">{String(row[column.key] ?? "—")}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-5 rounded-lg border border-border p-5">
        <p className="text-sm font-semibold">Status</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {STATUSES.map((status) => (
            <Button
              key={status}
              size="sm"
              variant={String(row.status ?? "new") === status ? "default" : "outline"}
              onClick={() => update.mutate({ status })}
            >
              {status}
            </Button>
          ))}
        </div>

        <p className="mt-5 text-sm font-semibold">Internal notes</p>
        <Textarea
          value={notes}
          placeholder="Internal notes"
          rows={4}
          className="mt-2"
          onChange={(e) => setNotes(e.target.value)}
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            disabled={update.isPending || notes === String(row.admin_notes ?? "")}
            onClick={() => update.mutate({ admin_notes: notes })}
          >
            Save notes
          </Button>
          {extraActions ? extraActions(row as Record<string, unknown>) : null}
          {access?.isAdmin ? (
            <Button
              size="sm"
              variant="destructive"
              className="ml-auto"
              disabled={remove.isPending}
              onClick={() => {
                if (confirm("Delete this enquiry? This cannot be undone.")) remove.mutate();
              }}
            >
              <Trash2 className="size-4" /> Delete
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
