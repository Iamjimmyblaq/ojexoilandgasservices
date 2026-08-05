import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getIndexingStatus } from "@/lib/search-console.functions";
import { RefreshCw, CheckCircle2, AlertTriangle, XCircle, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/seo")({
  component: SeoStatusPage,
  head: () => ({ meta: [{ title: "Indexing Status — OJEX Admin" }, { name: "robots", content: "noindex" }] }),
});

function verdictTone(verdict: string | null) {
  if (verdict === "PASS") return "text-emerald-600";
  if (verdict === "NEUTRAL" || verdict === "PARTIAL") return "text-amber-600";
  if (verdict === "FAIL") return "text-red-600";
  return "text-muted-foreground";
}

function VerdictIcon({ verdict }: { verdict: string | null }) {
  if (verdict === "PASS") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  if (verdict === "FAIL") return <XCircle className="h-4 w-4 text-red-600" />;
  return <AlertTriangle className="h-4 w-4 text-amber-600" />;
}

function fmt(d: string | null) {
  if (!d) return "—";
  const t = new Date(d);
  return Number.isNaN(t.getTime()) ? d : t.toLocaleString();
}

function SeoStatusPage() {
  const fetchStatus = useServerFn(getIndexingStatus);
  const [selected, setSelected] = useState<string | undefined>(undefined);

  const { data, isFetching, refetch, error } = useQuery({
    queryKey: ["gsc-indexing", selected ?? "auto"],
    queryFn: () => fetchStatus({ data: selected ? { site_url: selected } : {} }),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Google indexing status</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live Search Console index state for key pages, including the AI FAQ answer content.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-md border border-red-300 bg-red-50 p-4 text-sm text-red-800">
          {error instanceof Error ? error.message : "Could not load indexing status."}
        </div>
      )}

      {data?.status === "selection_required" && (
        <div className="rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-medium">{data.message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {data.candidates.map((c) => (
              <button key={c} onClick={() => setSelected(c)} className="rounded border border-amber-400 bg-white px-3 py-1.5 text-xs font-medium">
                {c}
              </button>
            ))}
          </div>
        </div>
      )}

      {(data?.status === "unavailable" || data?.status === "no_property") && (
        <div className="rounded-md border border-border bg-card p-4 text-sm text-muted-foreground">{data.message}</div>
      )}

      {data?.status === "ok" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Property" value={data.siteUrl ?? "—"} />
            <Stat label="Indexed (PASS)" value={`${data.pages.filter((p) => p.verdict === "PASS").length} / ${data.pages.length}`} />
            <Stat label="Checked" value={fmt(data.checkedAt)} />
          </div>

          <div className="overflow-x-auto rounded-lg border border-border bg-card">
            <table className="w-full min-w-[900px] text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Page</th>
                  <th className="px-4 py-3">Verdict</th>
                  <th className="px-4 py-3">Coverage</th>
                  <th className="px-4 py-3">Robots</th>
                  <th className="px-4 py-3">Last crawl</th>
                  <th className="px-4 py-3">Google canonical</th>
                </tr>
              </thead>
              <tbody>
                {data.pages.map((p) => (
                  <tr key={p.url} className="border-t border-border align-top">
                    <td className="px-4 py-3">
                      <div className="font-medium">{p.label}</div>
                      <a href={p.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:underline">
                        {p.url.replace("https://www.ojexoilandgasservices.com", "") || "/"} <ExternalLink className="h-3 w-3" />
                      </a>
                      {p.error && <div className="mt-1 text-xs text-red-600">{p.error}</div>}
                    </td>
                    <td className={`px-4 py-3 font-medium ${verdictTone(p.verdict)}`}>
                      <span className="inline-flex items-center gap-1.5"><VerdictIcon verdict={p.verdict} /> {p.verdict ?? "Unknown"}</span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{p.coverageState ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.robotsTxtState ?? "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{fmt(p.lastCrawlTime)}</td>
                    <td className="px-4 py-3 break-all text-xs text-muted-foreground">{p.googleCanonical ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.sitemap && (
            <div className="rounded-lg border border-border bg-card p-5">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Sitemap</h2>
              <p className="mt-1 break-all text-sm">{data.sitemap.sitemapUrl}</p>
              {data.sitemap.error ? (
                <p className="mt-2 text-sm text-amber-700">{data.sitemap.error}</p>
              ) : (
                <div className="mt-3 grid gap-3 sm:grid-cols-4 text-sm">
                  <div><span className="block text-xs text-muted-foreground">Last submitted</span>{fmt(data.sitemap.lastSubmitted)}</div>
                  <div><span className="block text-xs text-muted-foreground">Last downloaded</span>{fmt(data.sitemap.lastDownloaded)}</div>
                  <div><span className="block text-xs text-muted-foreground">Errors</span>{data.sitemap.errors ?? "0"}</div>
                  <div><span className="block text-xs text-muted-foreground">Warnings</span>{data.sitemap.warnings ?? "0"}</div>
                </div>
              )}
              <p className="mt-3 text-xs text-muted-foreground">
                Counts come from Search Console. This view reads Google's stored index state — it cannot request re-indexing; use URL Inspection in Search Console for that.
              </p>
            </div>
          )}
        </>
      )}

      {isFetching && !data && <div className="text-sm text-muted-foreground">Checking Search Console…</div>}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 break-all text-sm font-semibold">{value}</div>
    </div>
  );
}
