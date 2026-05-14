import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SITE } from "@/lib/site";
import { Award, Target, Eye, Heart } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: `About — ${SITE.name}` },
      { name: "description", content: "OJEX Oil and Gas Services — Nigerian-incorporated industrial sourcing, supply, and manpower company serving the energy sector." },
      { property: "og:title", content: "About OJEX Oil and Gas Services" },
      { property: "og:description", content: "Industrial sourcing, supply, and manpower for the energy sector." },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
});

function About() {
  return (
    <>
      <PageHero eyebrow="About OJEX" title="A trusted partner for industrial sourcing and energy-sector manpower." subtitle="Headquartered in Port Harcourt, OJEX serves operators, contractors, and industrial clients across West Africa." />
      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <span className="eyebrow">Our Story</span>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">Built on accountability, delivered through expertise.</h2>
            <p className="mt-5 text-muted-foreground">OJEX Oil and Gas Services was founded to bridge a gap in the West African energy supply chain: a single, reliable partner capable of sourcing certified equipment, distributing fuel and lubricants, and deploying skilled crews on demand. We work with vetted OEM partners, Tier-1 vendors, and a deep bench of technical talent to deliver against the toughest specifications and tightest deadlines.</p>
            <p className="mt-4 text-muted-foreground">Our team combines decades of upstream experience with disciplined procurement processes, full HSE compliance, and a commitment to local content development.</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              { i: Target, t: "Mission", d: "Deliver reliable industrial sourcing and manpower that keep energy operations running." },
              { i: Eye, t: "Vision", d: "To be West Africa's most trusted oilfield supply and recruitment partner." },
              { i: Award, t: "Quality", d: "API, ISO, and OEM-aligned standards on every order." },
              { i: Heart, t: "Values", d: "Integrity, safety, transparency, and partnership." },
            ].map((v) => (
              <div key={v.t} className="card-elevated">
                <v.i className="h-8 w-8 text-[color:var(--gold)]" />
                <h3 className="mt-3 text-lg font-bold">{v.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{v.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section bg-[color:var(--navy-deep)] text-white">
        <div className="container-x text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Ready to work with us?</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="btn-gold">Get in Touch</Link>
            <Link to="/vendor-registration" className="btn-outline-gold">Become a Vendor</Link>
          </div>
        </div>
      </section>
    </>
  );
}
