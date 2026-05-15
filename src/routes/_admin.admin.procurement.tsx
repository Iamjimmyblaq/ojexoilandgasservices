import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { downloadCSV, toCSV } from "@/lib/csv";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Plus } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/site";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_admin/admin/procurement")({ component: Procurement });

const STATUSES = ["draft", "submitted", "sourcing", "quoted", "approved", "ordered", "delivered", "closed", "cancelled"] as const;

function Procurement() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [filter, setFilter] = useState("");
  const [showNew, setShowNew] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-procurement"],
    queryFn: async () => {
      const { data, error } = await supabase.from("procurement_requests").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const create = useMutation({
    mutationFn: async (form: FormData) => {
      const payload = {
        title: String(form.get("title")),
        description: String(form.get("description")),
        category: String(form.get("category")),
        quantity: String(form.get("quantity") || ""),
        budget_estimate: form.get("budget") ? Number(form.get("budget")) : null,
        required_by: form.get("required_by") || null,
        delivery_location: String(form.get("delivery_location") || ""),
        priority: String(form.get("priority")) as "low" | "normal" | "high" | "urgent",
        status: "submitted" as const,
        created_by: user!.id,
      };
      const { error } = await supabase.from("procurement_requests").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-procurement"] }); setShowNew(false); toast.success("Procurement request created"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const rows = (data ?? []).filter((r) => !filter || r.status === filter);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Procurement Requests</h1>
          <p className="text-sm text-muted-foreground">{rows.length} request{rows.length === 1 ? "" : "s"}</p>
        </div>
        <div className="flex gap-2">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded border border-input bg-background px-3 py-2 text-sm">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => downloadCSV(`procurement-${Date.now()}.csv`, toCSV(rows))} className="btn-navy flex items-center gap-2 !py-2 !text-xs"><Download className="h-3 w-3" /> Export</button>
          <button onClick={() => setShowNew(!showNew)} className="btn-gold flex items-center gap-2 !py-2 !text-xs"><Plus className="h-3 w-3" /> New request</button>
        </div>
      </div>

      {showNew && (
        <form onSubmit={(e) => { e.preventDefault(); create.mutate(new FormData(e.currentTarget)); }} className="grid gap-3 rounded-lg border border-border bg-card p-5 sm:grid-cols-2">
          <input name="title" required placeholder="Title" className="sm:col-span-2 rounded border border-input bg-background px-3 py-2 text-sm" />
          <select name="category" className="rounded border border-input bg-background px-3 py-2 text-sm">{PRODUCT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          <select name="priority" defaultValue="normal" className="rounded border border-input bg-background px-3 py-2 text-sm"><option>low</option><option>normal</option><option>high</option><option>urgent</option></select>
          <input name="quantity" placeholder="Quantity / Units" className="rounded border border-input bg-background px-3 py-2 text-sm" />
          <input name="budget" type="number" step="0.01" placeholder="Budget estimate (USD)" className="rounded border border-input bg-background px-3 py-2 text-sm" />
          <input name="required_by" type="date" className="rounded border border-input bg-background px-3 py-2 text-sm" />
          <input name="delivery_location" placeholder="Delivery location" className="rounded border border-input bg-background px-3 py-2 text-sm" />
          <textarea name="description" rows={4} placeholder="Detailed specifications" className="sm:col-span-2 rounded border border-input bg-background px-3 py-2 text-sm" />
          <div className="sm:col-span-2 flex gap-2"><button className="btn-gold">Create</button><button type="button" onClick={() => setShowNew(false)} className="rounded border border-border px-4 py-2 text-sm">Cancel</button></div>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Reference</th><th className="p-3">Title</th><th className="p-3">Category</th><th className="p-3">Priority</th><th className="p-3">Status</th><th className="p-3">Created</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && rows.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No procurement requests yet.</td></tr>}
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-border">
                <td className="p-3 font-mono text-xs">
                  <Link to="/admin/procurement/$id" params={{ id: r.id }} className="text-[color:var(--gold-deep)] hover:underline">{r.reference}</Link>
                </td>
                <td className="p-3"><div className="font-medium">{r.title}</div><div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div></td>
                <td className="p-3 text-xs">{r.category}</td>
                <td className="p-3 text-xs uppercase">{r.priority}</td>
                <td className="p-3"><StatusBadge status={r.status} /></td>
                <td className="p-3 text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
