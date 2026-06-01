import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SITE, SERVICE_LINKS } from "@/lib/site";
import { SERVICES } from "@/lib/services-data";
import { ArrowRight, FileText } from "lucide-react";

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
        subtitle="Eight integrated service lines, one accountable partner. Click any service to request a quote — or open the full service page for details."
      />
      <section className="section">
        <div className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICE_LINKS.map((link) => {
            const s = SERVICES[slugFromPath(link.to)];
            if (!s) return null;
            return (
              <div key={link.to} className="card-elevated group flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--gold-deep)]">{s.eyebrow}</span>
                <h3 className="mt-2 text-xl font-bold leading-tight">{link.label}</h3>
                <p className="mt-3 text-sm text-muted-foreground line-clamp-3">{s.layman}</p>
                <div className="mt-5 flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to="/quote"
                    search={{ service: link.label }}
                    className="inline-flex items-center gap-1.5 rounded-md bg-[color:var(--gold)] px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[color:var(--navy-deep)] hover:bg-[color:var(--gold-deep)] hover:text-white transition-colors"
                  >
                    <FileText className="h-3 w-3" /> Request quote
                  </Link>
                  <Link to={link.to} className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[color:var(--navy)] hover:text-[color:var(--gold-deep)]">
                    Details <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
