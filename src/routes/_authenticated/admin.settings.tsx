import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { adminGetSettings, adminSaveSettings } from "@/lib/admin.functions";
import type { AdminRow } from "@/lib/admin-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { PageHeading } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  component: SettingsPage,
});

type FieldKind = "text" | "textarea" | "boolean" | "select" | "date";

const GROUPS: {
  title: string;
  blurb: string;
  fields: { name: string; label: string; kind: FieldKind; options?: string[]; help?: string }[];
}[] = [
  {
    title: "Brand",
    blurb: "Name, tagline and imagery used across the site.",
    fields: [
      { name: "site_name", label: "Site name", kind: "text" },
      { name: "tagline", label: "Tagline", kind: "text" },
      { name: "logo_url", label: "Logo URL", kind: "text", help: "Leave blank to use the built-in logo." },
      { name: "logo_dark_url", label: "Logo URL (dark backgrounds)", kind: "text" },
      { name: "favicon_url", label: "Favicon URL", kind: "text" },
      { name: "contact_email", label: "Contact email", kind: "text" },
      { name: "submit_url", label: "Submit form URL", kind: "text", help: "The Typeform the Submit button opens." },
    ],
  },
  {
    title: "Legal pages",
    blurb: "Content shown on the privacy and terms pages. Markdown-free plain text; blank lines start new paragraphs.",
    fields: [
      { name: "privacy_content", label: "Privacy policy", kind: "textarea" },
      { name: "privacy_updated_at", label: "Privacy last updated", kind: "date" },
      { name: "terms_content", label: "Terms & conditions", kind: "textarea" },
      { name: "terms_updated_at", label: "Terms last updated", kind: "date" },
    ],
  },
  {
    title: "Newsletter",
    blurb: "How signups are handled and where they are synced.",
    fields: [
      {
        name: "newsletter_provider",
        label: "Provider",
        kind: "select",
        options: ["none", "beehiiv", "mailchimp", "convertkit", "brevo", "resend"],
      },
      { name: "newsletter_list_id", label: "List / publication ID", kind: "text" },
      { name: "double_opt_in", label: "Require double opt-in", kind: "boolean" },
      { name: "welcome_email", label: "Send welcome email", kind: "boolean" },
    ],
  },
  {
    title: "SEO & analytics",
    blurb: "Defaults for search engines and social sharing.",
    fields: [
      { name: "seo_title_template", label: "Title template", kind: "text", help: "Use %s for the page title." },
      { name: "seo_description", label: "Default meta description", kind: "textarea" },
      { name: "seo_share_image_url", label: "Default share image URL", kind: "text" },
      { name: "analytics_id", label: "Analytics ID", kind: "text" },
      { name: "search_console_tag", label: "Search Console verification tag", kind: "text" },
    ],
  },
];

function SettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: () => adminGetSettings(),
  });
  const [values, setValues] = useState<AdminRow>({});

  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  const save = useMutation({
    mutationFn: (payload: AdminRow) => adminSaveSettings({ data: { values: payload } }),
    onSuccess: () => {
      toast.success("Settings saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "settings"] });
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <PageHeading
        title="Settings"
        description="Brand, legal pages, newsletter and SEO defaults. Changes apply to the live site immediately."
      />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(values);
        }}
        className="space-y-8"
      >
        {GROUPS.map((group) => (
          <section key={group.title} className="rounded-lg border border-border p-5">
            <h2 className="font-display text-lg font-semibold">{group.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{group.blurb}</p>
            <div className="mt-4 space-y-4">
              {group.fields.map((field) => {
                const id = `set-${field.name}`;
                const value = values[field.name];
                if (field.kind === "boolean") {
                  return (
                    <div
                      key={field.name}
                      className="flex items-center justify-between rounded-md border border-border px-3 py-2.5"
                    >
                      <Label htmlFor={id}>{field.label}</Label>
                      <Switch
                        id={id}
                        checked={!!value}
                        onCheckedChange={(checked) =>
                          setValues((prev) => ({ ...prev, [field.name]: checked }))
                        }
                      />
                    </div>
                  );
                }
                return (
                  <div key={field.name}>
                    <Label htmlFor={id}>{field.label}</Label>
                    {field.kind === "textarea" ? (
                      <Textarea
                        id={id}
                        rows={8}
                        className="mt-1.5"
                        value={(value as string) ?? ""}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                        }
                      />
                    ) : field.kind === "select" ? (
                      <select
                        id={id}
                        className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={(value as string) ?? ""}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                        }
                      >
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <Input
                        id={id}
                        type={field.kind === "date" ? "date" : "text"}
                        className="mt-1.5"
                        value={(value as string) ?? ""}
                        onChange={(e) =>
                          setValues((prev) => ({
                            ...prev,
                            [field.name]: e.target.value === "" ? null : e.target.value,
                          }))
                        }
                      />
                    )}
                    {field.help ? (
                      <p className="mt-1 text-xs text-muted-foreground">{field.help}</p>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        ))}

        <Button type="submit" disabled={save.isPending}>
          {save.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Save settings
        </Button>
      </form>
    </div>
  );
}
