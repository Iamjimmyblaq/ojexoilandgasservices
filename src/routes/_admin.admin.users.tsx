import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listAdminUsers, setUserRole } from "@/lib/admin-users.functions";
import { toast } from "sonner";
import { ShieldCheck, User as UserIcon } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/users")({ component: UsersPage });

const ROLES = ["admin", "manager"] as const;

function UsersPage() {
  const qc = useQueryClient();
  const fetchUsers = useServerFn(listAdminUsers);
  const updateRole = useServerFn(setUserRole);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: () => fetchUsers(),
  });

  const mutate = useMutation({
    mutationFn: (vars: { user_id: string; role: "admin" | "manager"; enabled: boolean }) =>
      updateRole({ data: vars }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Role updated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">Access Control</p>
        <h1 className="mt-1 text-2xl font-bold">User Roles</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Promote staff to admin or manager. Every signup defaults to a regular user.
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Last sign-in</th>
              <th className="p-3">Roles</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {(data ?? []).map((u) => {
              const isAdmin = u.roles.includes("admin");
              return (
                <tr key={u.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="flex items-center gap-2 font-medium">
                      {isAdmin ? <ShieldCheck className="h-4 w-4 text-[color:var(--gold-deep)]" /> : <UserIcon className="h-4 w-4 text-muted-foreground" />}
                      {u.email}
                    </div>
                    <div className="text-xs text-muted-foreground">{u.id.slice(0, 8)}…</div>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="p-3 text-xs text-muted-foreground">{u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString() : "—"}</td>
                  <td className="p-3">
                    <div className="flex flex-wrap gap-2">
                      {ROLES.map((role) => {
                        const enabled = u.roles.includes(role);
                        return (
                          <button
                            key={role}
                            onClick={() => mutate.mutate({ user_id: u.id, role, enabled: !enabled })}
                            disabled={mutate.isPending}
                            className={`rounded-full border px-3 py-1 text-xs capitalize transition ${
                              enabled
                                ? "border-[color:var(--gold-deep)] bg-[color:var(--gold)]/20 text-[color:var(--navy-deep)] font-medium"
                                : "border-border text-muted-foreground hover:border-foreground"
                            }`}
                          >
                            {enabled ? "✓ " : "+ "}{role}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Note: the official OJEX admin account (<strong>ojexoilandgasservices@gmail.com</strong>) cannot have its admin role removed.
      </p>
    </div>
  );
}
