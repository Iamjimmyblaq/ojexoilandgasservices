import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { downloadCSV, toCSV } from "@/lib/csv";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Trash2 } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/quotes")({ component: Quotes });

const STATUSES = ["new", "contacted", "quoted", "closed", "cancelled"] as const;

function Quotes() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<string>("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-quotes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("quote_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("quote_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-quotes"] }); toast.success("Updated"); },
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quote_requests").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-quotes"] }); toast.success("Deleted"); },
    onError: (e: Error) => toast.error(e.message || "Delete failed"),
  });

  const rows = (data ?? []).filter((r) => !filter || r.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Quote Requests</h1>
          <p className="text-sm text-muted-foreground">{rows.length} record{rows.length === 1 ? "" : "s"}</p>
        </div>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded border border-input bg-background px-3 py-2 text-sm">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => downloadCSV(`quotes-${Date.now()}.csv`, toCSV(rows))} className="btn-navy flex items-center gap-2 !py-2 !text-xs"><Download className="h-3 w-3" /> Export CSV</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-3">Date</th><th className="p-3">Company</th><th className="p-3">Contact</th><th className="p-3">Product/Service</th><th className="p-3">Status</th><th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && rows.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No quote requests.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border align-top">
                <td className="p-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
                <td className="p-3"><div className="font-medium">{r.company_name}</div><div className="text-xs text-muted-foreground">{r.delivery_location ?? "—"}</div></td>
                <td className="p-3"><div>{r.contact_name}</div><div className="text-xs text-muted-foreground">{r.email}</div><div className="text-xs text-muted-foreground">{r.phone ?? ""}</div></td>
                <td className="p-3 max-w-xs"><div className="font-medium">{r.product_service}</div><div className="text-xs text-muted-foreground">Qty: {r.quantity ?? "—"} · {r.timeline ?? ""}</div>{r.notes && <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{r.notes}</div>}</td>
                <td className="p-3"><StatusBadge status={r.status} /></td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <select defaultValue={r.status} onChange={(e) => update.mutate({ id: r.id, status: e.target.value })} className="rounded border border-input bg-background px-2 py-1 text-xs">
                      {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <button
                      onClick={() => { if (confirm(`Delete quote request from ${r.company_name}? This cannot be undone.`)) remove.mutate(r.id); }}
                      className="rounded border border-destructive/30 p-1.5 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-colors"
                      title="Delete"
                      aria-label="Delete quote request"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
