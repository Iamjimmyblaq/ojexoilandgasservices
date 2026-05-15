import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { downloadCSV, toCSV } from "@/lib/csv";
import { Download } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/contacts")({ component: Contacts });

function Contacts() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-contacts"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });
  const rows = data ?? [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Contact Messages</h1>
          <p className="text-sm text-muted-foreground">{rows.length} message{rows.length === 1 ? "" : "s"}</p>
        </div>
        <button onClick={() => downloadCSV(`contacts-${Date.now()}.csv`, toCSV(rows))} className="btn-navy flex items-center gap-2 !py-2 !text-xs"><Download className="h-3 w-3" /> Export CSV</button>
      </div>

      <div className="space-y-3">
        {isLoading && <p className="text-muted-foreground">Loading…</p>}
        {!isLoading && rows.length === 0 && <p className="text-muted-foreground">No messages.</p>}
        {rows.map((m) => (
          <div key={m.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-medium">{m.name} <span className="text-xs text-muted-foreground">· {m.email}</span></p>
                <p className="text-xs text-muted-foreground">{m.company ?? ""} {m.phone ? `· ${m.phone}` : ""}</p>
              </div>
              <p className="text-xs text-muted-foreground">{new Date(m.created_at).toLocaleString()}</p>
            </div>
            {m.subject && <p className="mt-2 text-sm font-medium">{m.subject}</p>}
            <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{m.message}</p>
            <a href={`mailto:${m.email}`} className="mt-3 inline-block text-xs text-[color:var(--gold-deep)] underline">Reply via email</a>
          </div>
        ))}
      </div>
    </div>
  );
}
