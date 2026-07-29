import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

import { adminGetIntegrations, adminSaveIntegrations } from "@/lib/admin.functions";
import type { AdminRow } from "@/lib/admin-schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeading } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/integrations")({
  component: IntegrationsPage,
});

type Field = {
  name: string;
  label: string;
  secret?: boolean;
  options?: string[];
  help?: string;
  placeholder?: string;
};

const GROUPS: { title: string; blurb: string; fields: Field[] }[] = [
  {
    title: "Newsletter provider (ESP)",
    blurb: "Where subscribers are synced and the weekly issue is sent from.",
    fields: [
      {
        name: "esp_provider",
        label: "Provider",
        options: ["none", "beehiiv", "mailchimp", "convertkit", "brevo", "resend", "kit"],
      },
      { name: "esp_api_key", label: "API key", secret: true, placeholder: "••••••••" },
      { name: "esp_publication_id", label: "Publication ID", help: "beehiiv publication / Kit form ID." },
      { name: "esp_audience_id", label: "Audience / list ID" },
      { name: "esp_from_name", label: "From name", placeholder: "The Affiliate Week" },
      { name: "esp_from_email", label: "From email", placeholder: "hello@theaffiliateweek.com" },
      { name: "esp_reply_to", label: "Reply-to email" },
    ],
  },
  {
    title: "Transactional email",
    blurb: "Used for welcome emails, double opt-in and admin notifications.",
    fields: [
      {
        name: "transactional_provider",
        label: "Provider",
        options: ["none", "resend", "sendgrid", "postmark", "brevo"],
      },
      { name: "transactional_api_key", label: "API key", secret: true },
      {
        name: "notify_email",
        label: "Notification inbox",
        help: "Where new submissions and sponsor enquiries are announced.",
      },
      { name: "slack_webhook_url", label: "Slack webhook URL", secret: true },
    ],
  },
  {
    title: "Anti-spam & webhooks",
    blurb: "Protects the public forms and authenticates inbound calls.",
    fields: [
      { name: "recaptcha_site_key", label: "reCAPTCHA site key", help: "Public — safe in the browser." },
      { name: "recaptcha_secret_key", label: "reCAPTCHA secret key", secret: true },
      {
        name: "webhook_shared_secret",
        label: "Webhook shared secret",
        secret: true,
        help: "Paste the same value into the sending service.",
      },
      { name: "sitemap_ping_url", label: "Sitemap ping URL" },
    ],
  },
];

function SecretInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative mt-1.5">
      <Input
        id={id}
        type={show ? "text" : "password"}
        autoComplete="off"
        spellCheck={false}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="pr-10"
      />
      <button
        type="button"
        onClick={() => setShow((prev) => !prev)}
        aria-label={show ? "Hide value" : "Show value"}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

function IntegrationsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "integrations"],
    queryFn: () => adminGetIntegrations(),
  });
  const [values, setValues] = useState<AdminRow>({});

  useEffect(() => {
    if (data) setValues(data);
  }, [data]);

  const save = useMutation({
    mutationFn: (payload: AdminRow) => adminSaveIntegrations({ data: { values: payload } }),
    onSuccess: () => {
      toast.success("API settings saved");
      queryClient.invalidateQueries({ queryKey: ["admin", "integrations"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-3xl">
      <PageHeading
        title="Integrations & API keys"
        description="Keys for your newsletter provider, transactional email and anti-spam. Admins only."
      />

      <div className="mb-6 flex gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm">
        <ShieldAlert className="mt-0.5 size-4 shrink-0" />
        <p className="text-muted-foreground">
          These values are stored in a private document that only admin accounts can read. They are
          never sent to the public site. Anything that must stay off the database entirely (Firebase
          service account, server-side keys) belongs in the server&apos;s <code>.env</code> file.
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate(values);
        }}
        className="space-y-8"
        autoComplete="off"
      >
        {GROUPS.map((group) => (
          <section key={group.title} className="rounded-lg border border-border p-5">
            <h2 className="font-display text-lg font-semibold">{group.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{group.blurb}</p>
            <div className="mt-4 space-y-4">
              {group.fields.map((field) => {
                const id = `int-${field.name}`;
                const value = (values[field.name] as string) ?? "";
                return (
                  <div key={field.name}>
                    <Label htmlFor={id}>{field.label}</Label>
                    {field.options ? (
                      <select
                        id={id}
                        className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                        value={value}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
                        }
                      >
                        {field.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.secret ? (
                      <SecretInput
                        id={id}
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(next) =>
                          setValues((prev) => ({ ...prev, [field.name]: next }))
                        }
                      />
                    ) : (
                      <Input
                        id={id}
                        className="mt-1.5"
                        value={value}
                        placeholder={field.placeholder}
                        onChange={(e) =>
                          setValues((prev) => ({ ...prev, [field.name]: e.target.value }))
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
          Save API settings
        </Button>
      </form>
    </div>
  );
}
