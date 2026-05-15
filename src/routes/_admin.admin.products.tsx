import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Edit } from "lucide-react";
import { PRODUCT_CATEGORIES } from "@/lib/site";

export const Route = createFileRoute("/_admin/admin/products")({ component: Products });

type Product = {
  id?: string; name: string; slug: string; category: string; sku?: string | null;
  short_description?: string | null; description?: string | null; manufacturer?: string | null;
  image_url?: string | null; featured?: boolean; in_stock?: boolean; active?: boolean;
};

const empty: Product = { name: "", slug: "", category: PRODUCT_CATEGORIES[0], featured: false, in_stock: true, active: true };

function Products() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Product | null>(null);
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const upsert = useMutation({
    mutationFn: async (p: Product) => {
      const payload = { ...p, slug: p.slug || p.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") };
      if (p.id) {
        const { error } = await supabase.from("products").update(payload).eq("id", p.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("products").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); setEditing(null); toast.success("Saved"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-products"] }); toast.success("Deleted"); },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">{data?.length ?? 0} products in catalog</p>
        </div>
        <button onClick={() => setEditing(empty)} className="btn-gold flex items-center gap-2 !py-2 !text-xs"><Plus className="h-3 w-3" /> New product</button>
      </div>

      {editing && (
        <form onSubmit={(e) => { e.preventDefault(); upsert.mutate(editing); }} className="grid gap-3 rounded-lg border border-border bg-card p-5 sm:grid-cols-2">
          <input required placeholder="Name" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className="rounded border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Slug (auto if empty)" value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} className="rounded border border-input bg-background px-3 py-2 text-sm" />
          <select value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} className="rounded border border-input bg-background px-3 py-2 text-sm">
            {PRODUCT_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input placeholder="SKU" value={editing.sku ?? ""} onChange={(e) => setEditing({ ...editing, sku: e.target.value })} className="rounded border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Manufacturer" value={editing.manufacturer ?? ""} onChange={(e) => setEditing({ ...editing, manufacturer: e.target.value })} className="rounded border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Image URL" value={editing.image_url ?? ""} onChange={(e) => setEditing({ ...editing, image_url: e.target.value })} className="rounded border border-input bg-background px-3 py-2 text-sm" />
          <textarea placeholder="Short description" value={editing.short_description ?? ""} onChange={(e) => setEditing({ ...editing, short_description: e.target.value })} rows={2} className="sm:col-span-2 rounded border border-input bg-background px-3 py-2 text-sm" />
          <textarea placeholder="Full description" value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} rows={4} className="sm:col-span-2 rounded border border-input bg-background px-3 py-2 text-sm" />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> Featured</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.in_stock} onChange={(e) => setEditing({ ...editing, in_stock: e.target.checked })} /> In stock</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Active</label>
          <div className="sm:col-span-2 flex gap-2">
            <button type="submit" className="btn-gold">Save</button>
            <button type="button" onClick={() => setEditing(null)} className="rounded border border-border px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Name</th><th className="p-3">Category</th><th className="p-3">SKU</th><th className="p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {(data ?? []).map((p) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3"><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.manufacturer ?? ""}</div></td>
                <td className="p-3 text-sm">{p.category}</td>
                <td className="p-3 text-xs text-muted-foreground">{p.sku ?? "—"}</td>
                <td className="p-3 text-xs">{p.active ? "Active" : "Hidden"} {p.featured ? "· Featured" : ""}</td>
                <td className="p-3">
                  <div className="flex gap-2">
                    <button onClick={() => setEditing(p)} className="rounded p-1 text-muted-foreground hover:text-foreground"><Edit className="h-4 w-4" /></button>
                    <button onClick={() => confirm("Delete this product?") && remove.mutate(p.id)} className="rounded p-1 text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
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
