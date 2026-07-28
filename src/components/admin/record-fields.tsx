import { AssetUpload } from "@/components/admin/AssetUpload";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminRow, FieldDef } from "@/lib/admin-schema";

export function toLocalInput(value: string | null): string {
  if (!value) return "";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(parsed.getHours())}:${pad(parsed.getMinutes())}`;
}

export function FieldInput({
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
          value={typeof value === "string" ? value : JSON.stringify(value ?? [], null, 2)}
          onChange={(e) => onChange(e.target.value)}
          rows={12}
          className="mt-1.5 font-mono text-xs"
        />
      ) : field.type === "image" ? (
        <AssetUpload id={id} value={(value as string) ?? ""} onChange={(next: string) => onChange(next)} />
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
            field.type === "datetime"
              ? toLocalInput(value as string | null)
              : ((value as string) ?? "")
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

export type RecordStatus = "live" | "scheduled" | "draft";

export function recordStatus(row: AdminRow): RecordStatus {
  if (!row.published) return "draft";
  if (row.publish_at && new Date(String(row.publish_at)).getTime() > Date.now()) return "scheduled";
  return "live";
}

export function StatusBadge({ row }: { row: AdminRow }) {
  const status = recordStatus(row);
  if (status === "draft") {
    return (
      <span className="rounded bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
        Draft
      </span>
    );
  }
  if (status === "scheduled") {
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
