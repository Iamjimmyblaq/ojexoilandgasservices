import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PageHero } from "@/components/PageHero";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SITE } from "@/lib/site";
import { Briefcase, FileText } from "lucide-react";

export const Route = createFileRoute("/my-applications")({
  component: MyApplications,
  head: () => ({
    meta: [
      { title: `My Applications — ${SITE.name}` },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const STATUS_DESCRIPTION: Record<string, string> = {
  new: "We've received your application. It's queued for review.",
  reviewing: "Our recruitment team is reviewing your application.",
  shortlisted: "You've been shortlisted — watch your inbox for next steps.",
  rejected: "We've decided to move forward with other candidates this time.",
  hired: "Welcome aboard! Our HR team will be in touch with offer details.",
};

function MyApplications() {
  const { user, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (!loading && !user) nav({ to: "/auth", search: { redirect: "/my-applications" } as any });
  }, [loading, user, nav]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["my-applications", user?.email],
    enabled: !!user?.email,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("job_applications")
        .select("id, reference, full_name, position_applied, status, created_at, cover_letter")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  if (loading || !user) {
    return <div className="grid min-h-[60vh] place-items-center text-muted-foreground">Loading…</div>;
  }

  return (
    <>
      <PageHero
        eyebrow="Candidate Dashboard"
        title="My applications."
        subtitle={`Signed in as ${user.email}. All applications you've submitted with this email appear here.`}
      />
      <section className="section">
        <div className="container-x mx-auto max-w-4xl">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading your applications…</p>
          ) : error ? (
            <p className="text-center text-red-600">{(error as Error).message}</p>
          ) : !data || data.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-10 text-center">
              <Briefcase className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No applications yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                You haven't applied to any positions with <strong>{user.email}</strong>.
              </p>
              <Link to="/careers" className="btn-gold mt-6 inline-block">Browse open roles</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {data.map((a) => (
                <div key={a.id} className="rounded-lg border border-border bg-card p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reference</div>
                      <div className="font-mono text-sm font-bold">{a.reference}</div>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>
                  <div className="mt-4 grid gap-1.5 text-sm">
                    <div className="flex items-center gap-2"><Briefcase className="h-4 w-4 text-muted-foreground" /><strong>{a.position_applied}</strong></div>
                    <div className="text-muted-foreground">Submitted {new Date(a.created_at).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}</div>
                  </div>
                  <div className="mt-4 rounded-md bg-muted/40 p-3 text-sm">
                    {STATUS_DESCRIPTION[a.status] ?? "Your application is being processed."}
                  </div>
                </div>
              ))}
              <div className="pt-4 text-center">
                <Link to="/careers" className="inline-flex items-center gap-2 text-sm text-[color:var(--gold-deep)] hover:underline">
                  <FileText className="h-4 w-4" /> Apply to another role
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
