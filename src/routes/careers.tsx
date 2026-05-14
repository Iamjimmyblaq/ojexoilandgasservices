import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { JobApplicationForm } from "@/components/forms/JobApplicationForm";
import { SITE } from "@/lib/site";
import { MapPin, Briefcase } from "lucide-react";

export const Route = createFileRoute("/careers")({
  component: Careers,
  head: () => ({
    meta: [
      { title: `Careers — ${SITE.name}` },
      { name: "description", content: "Join OJEX. Open positions in engineering, offshore operations, HSE, procurement, and logistics." },
      { property: "og:title", content: "Careers at OJEX" },
      { property: "og:url", content: "/careers" },
    ],
    links: [{ rel: "canonical", href: "/careers" }],
  }),
});

function Careers() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  useEffect(() => {
    supabase.from("job_listings").select("*").eq("active", true).order("created_at", { ascending: false }).then(({ data }) => setJobs(data ?? []));
  }, []);

  return (
    <>
      <PageHero eyebrow="Careers" title="Build your career with OJEX." subtitle="We're always looking for skilled professionals across engineering, offshore operations, and procurement." />
      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <h2 className="text-2xl font-bold">Open positions</h2>
            {jobs.map(j => (
              <button key={j.id} onClick={() => setSelected(j)} className={`block w-full rounded-lg border p-5 text-left transition-all hover:border-[color:var(--gold)] ${selected?.id === j.id ? "border-[color:var(--gold)] bg-secondary" : "border-border bg-card"}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold">{j.title}</h3>
                  <span className="rounded-full bg-[color:var(--gold)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest">{j.category}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{j.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{j.job_type}</span>
                </div>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{j.description}</p>
              </button>
            ))}
            {jobs.length === 0 && <p className="text-muted-foreground">No open positions at the moment. Submit a general application below.</p>}
          </div>
          <aside className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-bold">{selected ? `Apply: ${selected.title}` : "General application"}</h3>
            {selected && <p className="mt-2 text-sm text-muted-foreground">{selected.requirements}</p>}
            <div className="mt-4"><JobApplicationForm jobId={selected?.id} position={selected?.title} /></div>
          </aside>
        </div>
      </section>
    </>
  );
}
