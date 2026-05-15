import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PageHero } from "@/components/PageHero";
import { StatusBadge } from "@/components/admin/StatusBadge";

export const Route = createFileRoute("/procurement")({
  component: PortalProcurement,
  head: () => ({ meta: [{ title: "My Procurement Requests — OJEX" }, { name: "robots", content: "noindex" }] }),
});

function PortalProcurement() {
  const { user, loading } = useAuth();
  const nav = useNavigate();
  useEffect(() => { if (!loading && !user) nav({ to: "/auth" }); }, [user, loading, nav]);

  const { data } = useQuery({
    enabled: !!user,
    queryKey: ["my-procurement", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("procurement_requests").select("*").eq("created_by", user!.id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <>
      <PageHero eyebrow="Procurement Portal" title="My procurement requests." subtitle="Submit and track internal procurement requests." />
      <section className="section">
        <div className="container-x">
          <div className="mb-4 flex justify-end">
            <Link to="/admin/procurement" className="btn-gold !py-2 !text-xs">+ New / Manage in Admin</Link>
          </div>
          <div className="rounded-lg border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="p-3">Reference</th><th className="p-3">Title</th><th className="p-3">Category</th><th className="p-3">Status</th><th className="p-3">Created</th></tr>
              </thead>
              <tbody>
                {(data ?? []).length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No requests yet.</td></tr>}
                {(data ?? []).map((r) => (
                  <tr key={r.id} className="border-t border-border">
                    <td className="p-3 font-mono text-xs">{r.reference}</td>
                    <td className="p-3">{r.title}</td>
                    <td className="p-3 text-xs">{r.category}</td>
                    <td className="p-3"><StatusBadge status={r.status} /></td>
                    <td className="p-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
