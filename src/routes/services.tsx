import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SITE, SERVICE_LINKS } from "@/lib/site";
import { SERVICES } from "@/lib/services-data";
import { ArrowRight } from "lucide-react";

export const Route = createFileRoute("/services")({
  component: Services,
  head: () => ({
    meta: [
      { title: `Services — ${SITE.name}` },
      { name: "description", content: "Procurement, equipment supply, base oil & diesel, manpower, logistics, safety, offshore support, and vendor management — explained in plain English." },
      { property: "og:title", content: "Services — OJEX" },
      { property: "og:description", content: "Full-spectrum oil & gas servicing for energy operators." },
      { property: "og:url", content: "/services" },
    ],
    links: [{ rel: "canonical", href: "/services" }],
  }),
});

function slugFromPath(to: string) {
  return to.replace("/services/", "");
}

function Services() {
  return (
    <>
      <PageHero
        eyebrow="What We Do"
        title="Services built for the energy sector."
        subtitle="Eight integrated service lines, one accountable partner. Click any service to see real products and request a quote."
      />
      <section className="section">
        <div className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_LINKS.map((link) => {
            const s = SERVICES[slugFromPath(link.to)];
            if (!s) return null;
            return (
              <Link key={link.to} to={link.to} className="card-elevated group block">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--gold-deep)]">{s.eyebrow}</span>
                <h3 className="mt-2 text-xl font-bold leading-tight">{link.label}</h3>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{s.layman}</p>
                <span className="mt-5 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[color:var(--navy)] group-hover:text-[color:var(--gold)]">
                  Explore <ArrowRight className="h-3 w-3" />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
