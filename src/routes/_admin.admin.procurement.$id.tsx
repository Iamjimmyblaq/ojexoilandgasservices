import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { useState } from "react";
import { toast } from "sonner";
import { Upload, ChevronLeft, FileText, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/_admin/admin/procurement/$id")({ component: Detail });

const STATUSES = ["draft", "submitted", "sourcing", "quoted", "approved", "ordered", "delivered", "closed", "cancelled"] as const;

function Detail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();

  const req = useQuery({
    queryKey: ["procurement", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("procurement_requests").select("*").eq("id", id).single();
      if (error) throw error;
      return data;
    },
  });

  const vendors = useQuery({
    queryKey: ["vendors-list"],
    queryFn: async () => {
      const { data } = await supabase.from("vendor_registrations").select("id, company_name").order("company_name");
      return data ?? [];
    },
  });

  const docs = useQuery({
    queryKey: ["procurement-docs", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("procurement_documents").select("*").eq("request_id", id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const activity = useQuery({
    queryKey: ["procurement-activity", id],
    queryFn: async () => {
      const { data, error } = await supabase.from("procurement_activity").select("*").eq("request_id", id).order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const update = useMutation({
    mutationFn: async (patch: Record<string, unknown>) => {
      const { error } = await supabase.from("procurement_requests").update(patch).eq("id", id);
      if (error) throw error;
      await supabase.from("procurement_activity").insert({ request_id: id, actor_id: user!.id, action: "updated", details: patch });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["procurement", id] }); qc.invalidateQueries({ queryKey: ["procurement-activity", id] }); toast.success("Updated"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const path = `${user.id}/${id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("procurement-docs").upload(path, file);
      if (upErr) throw upErr;
      const { error } = await supabase.from("procurement_documents").insert({
        request_id: id, file_name: file.name, file_path: path, file_type: file.type, file_size: file.size, uploaded_by: user.id,
      });
      if (error) throw error;
      await supabase.from("procurement_activity").insert({ request_id: id, actor_id: user.id, action: "uploaded_document", details: { file_name: file.name } });
      qc.invalidateQueries({ queryKey: ["procurement-docs", id] });
      qc.invalidateQueries({ queryKey: ["procurement-activity", id] });
      toast.success("Uploaded");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function downloadDoc(path: string, name: string) {
    const { data, error } = await supabase.storage.from("procurement-docs").createSignedUrl(path, 60);
    if (error || !data) { toast.error("Could not get download URL"); return; }
    const a = document.createElement("a");
    a.href = data.signedUrl; a.download = name; a.target = "_blank"; a.click();
  }

  async function deleteDoc(docId: string, path: string) {
    if (!confirm("Delete this document?")) return;
    await supabase.storage.from("procurement-docs").remove([path]);
    await supabase.from("procurement_documents").delete().eq("id", docId);
    qc.invalidateQueries({ queryKey: ["procurement-docs", id] });
    toast.success("Deleted");
  }

  if (req.isLoading) return <p className="text-muted-foreground">Loading…</p>;
  if (!req.data) return <p>Not found.</p>;
  const r = req.data;

  return (
    <div className="space-y-6">
      <Link to="/admin/procurement" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ChevronLeft className="h-4 w-4" /> All requests</Link>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-xs text-muted-foreground">{r.reference}</p>
          <h1 className="text-2xl font-bold">{r.title}</h1>
          <div className="mt-2 flex items-center gap-2 text-xs"><StatusBadge status={r.status} /><span className="text-muted-foreground">Priority: {r.priority}</span></div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-semibold">Specifications</h3>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{r.description ?? "—"}</p>
            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div><span className="text-muted-foreground">Category:</span> {r.category}</div>
              <div><span className="text-muted-foreground">Quantity:</span> {r.quantity ?? "—"}</div>
              <div><span className="text-muted-foreground">Budget:</span> {r.budget_estimate ? `${r.currency ?? "USD"} ${r.budget_estimate}` : "—"}</div>
              <div><span className="text-muted-foreground">Required by:</span> {r.required_by ?? "—"}</div>
              <div className="sm:col-span-2"><span className="text-muted-foreground">Delivery:</span> {r.delivery_location ?? "—"}</div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Documents</h3>
              <label className="btn-navy flex cursor-pointer items-center gap-2 !py-1.5 !text-xs">
                <Upload className="h-3 w-3" /> {uploading ? "Uploading…" : "Upload"}
                <input type="file" className="hidden" onChange={handleFile} disabled={uploading} />
              </label>
            </div>
            <div className="mt-3 space-y-2">
              {(docs.data ?? []).length === 0 && <p className="text-sm text-muted-foreground">No documents yet.</p>}
              {(docs.data ?? []).map((d) => (
                <div key={d.id} className="flex items-center justify-between rounded border border-border p-3">
                  <button onClick={() => downloadDoc(d.file_path, d.file_name)} className="flex items-center gap-2 text-left text-sm hover:text-[color:var(--gold-deep)]">
                    <FileText className="h-4 w-4" />
                    <div>
                      <div className="font-medium">{d.file_name}</div>
                      <div className="text-xs text-muted-foreground">{(d.file_size ? (d.file_size / 1024).toFixed(1) + " KB" : "")} · {new Date(d.created_at).toLocaleDateString()}</div>
                    </div>
                  </button>
                  <button onClick={() => deleteDoc(d.id, d.file_path)} className="text-red-600 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-semibold">Activity</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {(activity.data ?? []).length === 0 && <li className="text-muted-foreground">No activity yet.</li>}
              {(activity.data ?? []).map((a) => (
                <li key={a.id} className="flex justify-between border-b border-border py-2 last:border-0">
                  <span><span className="font-medium">{a.action}</span> {a.details && Object.keys(a.details as object).length ? <span className="text-muted-foreground"> · {JSON.stringify(a.details)}</span> : null}</span>
                  <span className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-semibold">Manage</h3>
            <label className="mt-3 block text-xs uppercase tracking-wider text-muted-foreground">Status</label>
            <select defaultValue={r.status} onChange={(e) => update.mutate({ status: e.target.value })} className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className="mt-3 block text-xs uppercase tracking-wider text-muted-foreground">Assigned vendor</label>
            <select defaultValue={r.assigned_vendor_id ?? ""} onChange={(e) => update.mutate({ assigned_vendor_id: e.target.value || null })} className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm">
              <option value="">— None —</option>
              {(vendors.data ?? []).map((v) => <option key={v.id} value={v.id}>{v.company_name}</option>)}
            </select>
            <label className="mt-3 block text-xs uppercase tracking-wider text-muted-foreground">Internal notes</label>
            <textarea defaultValue={r.notes ?? ""} onBlur={(e) => e.target.value !== (r.notes ?? "") && update.mutate({ notes: e.target.value })} rows={4} className="mt-1 w-full rounded border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </aside>
      </div>
    </div>
  );
}
