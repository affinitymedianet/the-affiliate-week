import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useState } from "react";

import {
  adminCreateStaff,
  adminDeactivateStaff,
  adminListTeam,
  adminSendPasswordReset,
  adminSetRole,
} from "@/lib/admin.functions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PageHeading } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/_authenticated/admin/team")({
  component: TeamPage,
});

function TeamPage() {
  const queryClient = useQueryClient();
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["admin", "team"],
    queryFn: () => adminListTeam(),
  });

  const [email, setEmail] = useState("");
  const [role, setRole2] = useState<"editor" | "admin">("editor");
  const [issued, setIssued] = useState<{ email: string; password: string } | null>(null);

  const createStaff = useMutation({
    mutationFn: () => adminCreateStaff({ data: { email, role } }),
    onSuccess: (result) => {
      setIssued(result);
      setEmail("");
      toast.success("Account created");
      queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const setRole = useMutation({
    mutationFn: (input: { userId: string; role: string; grant: boolean }) =>
      adminSetRole({ data: input }),
    onSuccess: () => {
      toast.success("Roles updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const sendReset = useMutation({
    mutationFn: (input: { email: string }) =>
      adminSendPasswordReset({
        data: { email: input.email, redirectTo: `${window.location.origin}/a6b8` },
      }),
    onSuccess: () => toast.success("Reset link sent"),
    onError: (err: Error) => toast.error(err.message),
  });

  const deactivate = useMutation({
    mutationFn: (input: { userId: string }) => adminDeactivateStaff({ data: input }),
    onSuccess: () => {
      toast.success("Account deactivated");
      queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="max-w-3xl">
      <PageHeading
        title="Team & roles"
        description="Public sign-up is disabled — staff accounts are created here. Admins manage settings, roles and deletions; editors manage content."
      />

      <div className="mb-8 rounded-lg border border-border p-4">
        <h2 className="font-display text-lg font-semibold">Add a staff account</h2>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Input
            type="email"
            placeholder="name@theaffiliateweek.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            className="w-64"
          />
          <select
            value={role}
            onChange={(e) => setRole2(e.target.value as "editor" | "admin")}
            className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="editor">Editor</option>
            <option value="admin">Admin</option>
          </select>
          <Button onClick={() => createStaff.mutate()} disabled={createStaff.isPending || !email}>
            Create account
          </Button>
        </div>
        {issued ? (
          <p className="mt-3 rounded-md bg-muted p-3 text-sm">
            One-time password for <strong>{issued.email}</strong>:{" "}
            <code className="font-mono">{issued.password}</code>
            <br />
            Share it securely and ask them to change it after signing in. It will not be shown again.
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <div className="divide-y divide-border rounded-lg border border-border">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex flex-wrap items-center justify-between gap-3 p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{member.email ?? member.id}</p>
                <p className="text-sm text-muted-foreground">
                  {member.roles.length ? member.roles.join(", ") : "no access"}
                </p>
              </div>
              <div className="flex gap-2">
                {(["editor", "admin"] as const).map((role) => {
                  const has = member.roles.includes(role);
                  return (
                    <Button
                      key={role}
                      size="sm"
                      variant={has ? "default" : "outline"}
                      onClick={() =>
                        setRole.mutate({ userId: member.id, role, grant: !has })
                      }
                    >
                      {has ? `Remove ${role}` : `Make ${role}`}
                    </Button>
                  );
                })}
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!member.email || sendReset.isPending}
                  onClick={() => sendReset.mutate({ email: member.email as string })}
                >
                  Send reset link
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={deactivate.isPending}
                  onClick={() => {
                    if (
                      confirm(
                        `Deactivate ${member.email ?? member.id}? They lose all access immediately.`,
                      )
                    ) {
                      deactivate.mutate({ userId: member.id });
                    }
                  }}
                >
                  Deactivate
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
