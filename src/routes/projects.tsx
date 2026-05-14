import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SITE } from "@/lib/site";

const PROJECTS = [
  { title: "Bulk AGO supply — Onshore drilling campaign", client: "Confidential E&P", scope: "Continuous diesel supply to a 6-month drilling campaign in the Niger Delta." },
  { title: "Shale shaker & screen replacement program", client: "Drilling Contractor", scope: "Sourced and delivered API-rated shaker screens with 48-hour expediting." },
  { title: "Offshore PPE outfitting", client: "Marine Operator", scope: "Full PPE & FRC kit-out for 120 offshore personnel ahead of mobilisation." },
  { title: "Manpower deployment — HSE leads", client: "EPC Contractor", scope: "Recruited and deployed 8 NEBOSH-certified HSE officers to a brownfield project." },
];

export const Route = createFileRoute("/projects")({
  component: () => (
    <>
      <PageHero eyebrow="Case Studies" title="Projects & deliveries." subtitle="A snapshot of recent work across procurement, supply, and manpower." />
      <section className="section"><div className="container-x grid gap-5 sm:grid-cols-2">
        {PROJECTS.map(p => (
          <div key={p.title} className="card-elevated">
            <span className="text-xs font-semibold uppercase tracking-widest text-[color:var(--gold)]">{p.client}</span>
            <h3 className="mt-2 text-lg font-bold">{p.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{p.scope}</p>
          </div>
        ))}
      </div></section>
    </>
  ),
  head: () => ({ meta: [{ title: `Projects — ${SITE.name}` }, { name: "description", content: "Recent OJEX projects in supply, procurement, and manpower." }, { property: "og:url", content: "/projects" }], links: [{ rel: "canonical", href: "/projects" }] }),
});
