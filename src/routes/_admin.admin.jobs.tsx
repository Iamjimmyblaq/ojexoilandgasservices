import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { downloadCSV, toCSV } from "@/lib/csv";
import { useState } from "react";
import { toast } from "sonner";
import { Download, Plus } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/jobs")({ component: Jobs });

const APP_STATUSES = ["new", "reviewing", "shortlisted", "rejected", "hired"] as const;

function Jobs() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"applications" | "listings">("applications");
  const [showNew, setShowNew] = useState(false);

  const apps = useQuery({
    queryKey: ["admin-applications"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_applications").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const listings = useQuery({
    queryKey: ["admin-listings"],
    queryFn: async () => {
      const { data, error } = await supabase.from("job_listings").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const updateApp = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from("job_applications").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-applications"] }); toast.success("Updated"); },
  });

  const toggleListing = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase.from("job_listings").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-listings"] }); },
  });

  const createListing = useMutation({
    mutationFn: async (form: { title: string; category: string; location: string; job_type: string; description: string; requirements: string }) => {
      const { error } = await supabase.from("job_listings").insert(form);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-listings"] }); setShowNew(false); toast.success("Listing created"); },
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Jobs & Applications</h1>
          <div className="mt-2 flex gap-2 text-sm">
            <button onClick={() => setTab("applications")} className={`rounded-full px-3 py-1 ${tab === "applications" ? "bg-[color:var(--navy-deep)] text-white" : "border border-border"}`}>Applications ({apps.data?.length ?? 0})</button>
            <button onClick={() => setTab("listings")} className={`rounded-full px-3 py-1 ${tab === "listings" ? "bg-[color:var(--navy-deep)] text-white" : "border border-border"}`}>Listings ({listings.data?.length ?? 0})</button>
          </div>
        </div>
        <div className="flex gap-2">
          {tab === "listings" && <button onClick={() => setShowNew(!showNew)} className="btn-gold flex items-center gap-2 !py-2 !text-xs"><Plus className="h-3 w-3" /> New listing</button>}
          {tab === "applications" && <button onClick={() => downloadCSV(`applications-${Date.now()}.csv`, toCSV(apps.data ?? []))} className="btn-navy flex items-center gap-2 !py-2 !text-xs"><Download className="h-3 w-3" /> Export</button>}
        </div>
      </div>

      {showNew && tab === "listings" && (
        <form onSubmit={(e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          createListing.mutate({
            title: String(f.get("title")), category: String(f.get("category")), location: String(f.get("location")),
            job_type: String(f.get("job_type")), description: String(f.get("description")), requirements: String(f.get("requirements")),
          });
        }} className="grid gap-3 rounded-lg border border-border bg-card p-5 sm:grid-cols-2">
          <input name="title" placeholder="Job title" required className="rounded border border-input bg-background px-3 py-2 text-sm" />
          <input name="category" placeholder="Category" required className="rounded border border-input bg-background px-3 py-2 text-sm" />
          <input name="location" placeholder="Location" required className="rounded border border-input bg-background px-3 py-2 text-sm" />
          <select name="job_type" className="rounded border border-input bg-background px-3 py-2 text-sm"><option>Full-time</option><option>Contract</option><option>Rotational</option></select>
          <textarea name="description" placeholder="Description" required rows={3} className="sm:col-span-2 rounded border border-input bg-background px-3 py-2 text-sm" />
          <textarea name="requirements" placeholder="Requirements" rows={3} className="sm:col-span-2 rounded border border-input bg-background px-3 py-2 text-sm" />
          <button className="btn-gold sm:col-span-2">Create listing</button>
        </form>
      )}

      {tab === "applications" && (
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full text-sm">
            <thead className="bg-muted text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="p-3">Date</th><th className="p-3">Applicant</th><th className="p-3">Position</th><th className="p-3">Experience</th><th className="p-3">Status</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {(apps.data ?? []).map((a) => (
                <tr key={a.id} className="border-t border-border align-top">
                  <td className="p-3 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</td>
                  <td className="p-3"><div className="font-medium">{a.full_name}</div><div className="text-xs text-muted-foreground">{a.email}</div><div className="text-xs text-muted-foreground">{a.phone ?? ""}</div></td>
                  <td className="p-3 max-w-xs"><div>{a.position_applied}</div>{a.cover_letter && <div className="mt-1 line-clamp-2 text-xs text-muted-foreground">{a.cover_letter}</div>}{a.resume_url && /^https?:\/\//i.test(a.resume_url) && <a href={a.resume_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[color:var(--gold-deep)] underline">Resume</a>}</td>
                  <td className="p-3">{a.experience_years ?? "—"} yrs</td>
                  <td className="p-3"><StatusBadge status={a.status} /></td>
                  <td className="p-3"><select defaultValue={a.status} onChange={(e) => updateApp.mutate({ id: a.id, status: e.target.value })} className="rounded border border-input bg-background px-2 py-1 text-xs">{APP_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "listings" && (
        <div className="space-y-3">
          {(listings.data ?? []).map((j) => (
            <div key={j.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">{j.title} {!j.active && <span className="ml-2 rounded bg-gray-200 px-2 py-0.5 text-[10px] uppercase">Inactive</span>}</p>
                  <p className="text-xs text-muted-foreground">{j.category} · {j.location} · {j.job_type}</p>
                </div>
                <button onClick={() => toggleListing.mutate({ id: j.id, active: !j.active })} className="text-xs text-[color:var(--gold-deep)] underline">{j.active ? "Deactivate" : "Activate"}</button>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{j.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
