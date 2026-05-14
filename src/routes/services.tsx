import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SERVICE_LINKS, SITE } from "@/lib/site";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  component: Services,
  head: () => ({
    meta: [
      { title: `Services — ${SITE.name}` },
      { name: "description", content: "Procurement, equipment supply, base oil & diesel, manpower, logistics, safety, offshore support, and vendor management." },
      { property: "og:title", content: "Services — OJEX" },
      { property: "og:description", content: "Full-spectrum oil & gas servicing for energy operators." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
});

function Services() {
  return (
    <>
      <PageHero eyebrow="What We Do" title="Services built for the energy sector." subtitle="Eight integrated service lines, one accountable partner." />
      <section className="section">
        <div className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_LINKS.map((s) => (
            <Link key={s.to} to={s.to} className="card-elevated group block">
              <h3 className="text-xl font-bold">{s.label}</h3>
              <p className="mt-3 text-sm text-muted-foreground">Specialist capability with vetted suppliers, quality assurance, and on-time delivery.</p>
              <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[color:var(--navy)] group-hover:text-[color:var(--gold)]">Explore <ArrowRight className="h-3 w-3" /></span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
