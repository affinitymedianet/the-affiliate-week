import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { adminListTeam, adminSetRole } from "@/lib/admin.functions";
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

  const setRole = useMutation({
    mutationFn: (input: { userId: string; role: string; grant: boolean }) =>
      adminSetRole({ data: input }),
    onSuccess: () => {
      toast.success("Roles updated");
      queryClient.invalidateQueries({ queryKey: ["admin", "team"] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <div className="max-w-3xl">
      <PageHeading
        title="Team & roles"
        description="Anyone can create an account, but only people with a role here can reach the control room. Admins manage settings, roles and deletions; editors manage content."
      />

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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
