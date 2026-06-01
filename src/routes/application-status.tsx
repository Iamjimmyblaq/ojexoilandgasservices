import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { lookupJobApplication } from "@/lib/email.functions";
import { PageHero } from "@/components/PageHero";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { SITE } from "@/lib/site";
import { Search, AlertCircle } from "lucide-react";

const searchSchema = z.object({
  ref: z.string().trim().max(60).optional(),
  email: z.string().trim().max(255).optional(),
});

export const Route = createFileRoute("/application-status")({
  component: AppStatus,
  validateSearch: (s) => searchSchema.parse(s),
  head: () => ({
    meta: [
      { title: `Track your application — ${SITE.name}` },
      { name: "description", content: "Look up the status of your OJEX job application using your reference number and email." },
      { property: "og:title", content: "Track your application — OJEX" },
      { property: "og:url", content: "/application-status" },
    ],
    links: [{ rel: "canonical", href: "/application-status" }],
  }),
});

type LookupResult =
  | { found: true; application: { reference: string; full_name: string; position_applied: string; status: string; created_at: string } }
  | { found: false };

const STATUS_DESCRIPTION: Record<string, string> = {
  new: "We've received your application. It's queued for review.",
  reviewing: "Our recruitment team is reviewing your application.",
  shortlisted: "Congratulations — you've been shortlisted! Watch your inbox for next steps.",
  rejected: "Thank you for applying. We've decided to move forward with other candidates this time.",
  hired: "Welcome aboard! Our HR team will be in touch with your offer details.",
};

function AppStatus() {
  const { ref, email } = Route.useSearch();
  const lookup = useServerFn(lookupJobApplication);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setResult(null);
    const fd = new FormData(e.currentTarget);
    const r = String(fd.get("ref") || "").trim();
    const em = String(fd.get("email") || "").trim();
    if (!r || !em) { setError("Both reference and email are required."); return; }
    setLoading(true);
    try {
      const res = await lookup({ data: { reference: r, email: em } });
      setResult(res as LookupResult);
    } catch (err: any) {
      setError(err?.message || "Lookup failed. Please try again.");
    }
    setLoading(false);
  }

  return (
    <>
      <PageHero
        eyebrow="Application Tracker"
        title="Track your application."
        subtitle="Enter the reference number we emailed you and the email address you applied with."
      />
      <section className="section">
        <div className="container-x mx-auto max-w-2xl">
          <form
            onSubmit={onSubmit}
            className="grid gap-4 rounded-lg border border-border bg-card p-6"
          >
            <div>
              <label className="mb-1.5 block text-sm font-medium">Reference number *</label>
              <input
                name="ref"
                required
                defaultValue={ref}
                placeholder="JOB-260601-A1B2C3"
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 font-mono text-sm focus:border-[color:var(--gold)] focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email used to apply *</label>
              <input
                name="email"
                type="email"
                required
                defaultValue={email}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm focus:border-[color:var(--gold)] focus:outline-none"
              />
            </div>
            <button disabled={loading} className="btn-gold inline-flex items-center justify-center gap-2 disabled:opacity-60">
              <Search className="h-4 w-4" />
              {loading ? "Looking up…" : "Check status"}
            </button>
          </form>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          {result && !result.found && (
            <div className="mt-4 rounded-md border border-border bg-card p-5 text-sm text-muted-foreground">
              We couldn't find an application matching that reference and email. Please double-check both fields. If you've recently applied, give us a few minutes.
            </div>
          )}

          {result && result.found && (
            <div className="mt-6 rounded-lg border border-[color:var(--gold)]/40 bg-card p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Reference</div>
                  <div className="font-mono text-base font-bold">{result.application.reference}</div>
                </div>
                <StatusBadge status={result.application.status} />
              </div>
              <div className="mt-5 grid gap-2 text-sm">
                <div><span className="text-muted-foreground">Applicant: </span><strong>{result.application.full_name}</strong></div>
                <div><span className="text-muted-foreground">Position: </span><strong>{result.application.position_applied}</strong></div>
                <div><span className="text-muted-foreground">Submitted: </span>{new Date(result.application.created_at).toLocaleDateString()}</div>
              </div>
              <div className="mt-5 rounded-md bg-muted/40 p-4 text-sm text-foreground">
                {STATUS_DESCRIPTION[result.application.status] ?? "Your application is being processed."}
              </div>
            </div>
          )}

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Don't have a reference number?{" "}
            <Link to="/careers" className="text-[color:var(--gold-deep)] underline">
              Browse open roles
            </Link>{" "}
            or contact us.
          </p>
        </div>
      </section>
    </>
  );
}
