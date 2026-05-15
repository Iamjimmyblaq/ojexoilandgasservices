import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { downloadCSV, toCSV } from "@/lib/csv";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/vendors")({ component: Vendors });

function Vendors() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-vendors"],
    queryFn: async () => {
      const { data, error } = await supabase.from("vendor_registrations").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Vendor Registrations</h1>
          <p className="text-sm text-muted-foreground">{rows.length} vendor{rows.length === 1 ? "" : "s"}</p>
        </div>
        <button onClick={() => downloadCSV(`vendors-${Date.now()}.csv`, toCSV(rows))} className="btn-navy flex items-center gap-2 !py-2 !text-xs"><Download className="h-3 w-3" /> Export CSV</button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">Date</th><th className="p-3">Company</th><th className="p-3">Contact</th><th className="p-3">Category</th><th className="p-3">Country</th><th className="p-3">Capabilities</th></tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!isLoading && rows.length === 0 && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">No vendors registered.</td></tr>}
            {rows.map((v) => (
              <tr key={v.id} className="border-t border-border align-top">
                <td className="p-3 text-xs text-muted-foreground">{new Date(v.created_at).toLocaleDateString()}</td>
                <td className="p-3"><div className="font-medium">{v.company_name}</div>{v.website && <a className="text-xs text-muted-foreground hover:underline" href={v.website} target="_blank" rel="noopener noreferrer">{v.website}</a>}</td>
                <td className="p-3"><div>{v.contact_name}</div><div className="text-xs text-muted-foreground">{v.email}</div><div className="text-xs text-muted-foreground">{v.phone ?? ""}</div></td>
                <td className="p-3">{v.category}</td>
                <td className="p-3">{v.country ?? "—"}</td>
                <td className="p-3 max-w-xs"><p className="line-clamp-3 text-xs text-muted-foreground">{v.capabilities ?? ""}</p></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
