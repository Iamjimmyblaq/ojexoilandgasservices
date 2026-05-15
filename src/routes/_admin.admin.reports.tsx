import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { downloadCSV, toCSV } from "@/lib/csv";
import { useState } from "react";
import { Download } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/site";

export const Route = createFileRoute("/_admin/admin/reports")({ component: Reports });

type Source = "quote_requests" | "contact_messages" | "vendor_registrations" | "job_applications" | "procurement_requests";

const SOURCES: { value: Source; label: string; categoryCol?: string }[] = [
  { value: "quote_requests", label: "Quote Requests" },
  { value: "contact_messages", label: "Contact Messages" },
  { value: "vendor_registrations", label: "Vendor Registrations", categoryCol: "category" },
  { value: "job_applications", label: "Job Applications" },
  { value: "procurement_requests", label: "Procurement Requests", categoryCol: "category" },
];

function Reports() {
  const [source, setSource] = useState<Source>("quote_requests");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [category, setCategory] = useState("");

  const meta = SOURCES.find((s) => s.value === source)!;

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["report", source, from, to, category],
    queryFn: async () => {
      let q = supabase.from(source).select("*").order("created_at", { ascending: false });
      if (from) q = q.gte("created_at", from);
      if (to) q = q.lte("created_at", to + "T23:59:59");
      if (category && meta.categoryCol) q = q.eq(meta.categoryCol, category);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Reports & Exports</h1>
        <p className="text-sm text-muted-foreground">Filter inquiries and export CSV reports.</p>
      </div>

      <div className="grid gap-3 rounded-lg border border-border bg-card p-5 sm:grid-cols-2 lg:grid-cols-5">
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground">Source</label>
          <select value={source} onChange={(e) => setSource(e.target.value as Source)} className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm">
            {SOURCES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground">From</label>
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground">To</label>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wider text-muted-foreground">Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} disabled={!meta.categoryCol} className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm disabled:opacity-50">
            <option value="">All</option>
            {PRODUCT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex items-end gap-2">
          <button onClick={() => refetch()} className="btn-navy !py-2 !text-xs">{isFetching ? "Loading…" : "Apply"}</button>
          <button onClick={() => downloadCSV(`${source}-${Date.now()}.csv`, toCSV(rows))} disabled={!rows.length} className="btn-gold flex items-center gap-2 !py-2 !text-xs disabled:opacity-50"><Download className="h-3 w-3" /> Export CSV</button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5">
        <p className="text-sm text-muted-foreground">{isLoading ? "Loading…" : `${rows.length} record${rows.length === 1 ? "" : "s"} match the filters.`}</p>
        {rows.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted text-left uppercase tracking-wider text-muted-foreground">
                <tr>{Object.keys(rows[0]).slice(0, 6).map((k) => <th key={k} className="p-2">{k}</th>)}</tr>
              </thead>
              <tbody>
                {rows.slice(0, 50).map((r, i) => {
                  const row = r as Record<string, unknown>;
                  return (
                    <tr key={i} className="border-t border-border">
                      {Object.keys(rows[0]).slice(0, 6).map((k) => (
                        <td key={k} className="max-w-[200px] truncate p-2">{typeof row[k] === "object" ? JSON.stringify(row[k]) : String(row[k] ?? "")}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length > 50 && <p className="mt-2 text-xs text-muted-foreground">Showing first 50. Export for full list.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
