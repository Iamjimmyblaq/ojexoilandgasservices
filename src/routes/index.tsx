import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Truck, Wrench, Users, Fuel, Anchor, HardHat, Globe2, CheckCircle2 } from "lucide-react";
import heroImg from "@/assets/hero-rig.jpg";
import dieselImg from "@/assets/diesel-supply.jpg";
import equipmentImg from "@/assets/equipment.jpg";
import manpowerImg from "@/assets/manpower.jpg";
import { SITE, INDUSTRIES } from "@/lib/site";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "OJEX — Industrial Sourcing & Oilfield Manpower" },
      { name: "description", content: SITE.description },
      { property: "og:title", content: `${SITE.name} — Industrial Sourcing & Manpower` },
      { property: "og:description", content: SITE.description },
      { property: "og:url", content: "https://ojexoilandgasservices.lovable.app/" },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c2c106a6-f1ab-4322-a57d-978d7e1ef220" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/c2c106a6-f1ab-4322-a57d-978d7e1ef220" },
    ],
    links: [
      { rel: "canonical", href: "https://ojexoilandgasservices.lovable.app/" },
      { rel: "preload", as: "image", href: heroImg, fetchpriority: "high" } as any,
    ],
  }),
});

const SERVICES = [
  { icon: Wrench, title: "Procurement & Sourcing", desc: "Global sourcing of certified industrial equipment, spares, and consumables.", to: "/services/procurement" },
  { icon: HardHat, title: "Equipment Supply", desc: "Shale shakers, mud cleaners, drilling tools, and offshore equipment.", to: "/services/equipment" },
  { icon: Fuel, title: "Base Oil & Diesel", desc: "Bulk AGO/diesel and base oil supply across Nigeria and West Africa.", to: "/services/diesel" },
  { icon: Users, title: "Manpower Recruitment", desc: "Technical, engineering, and offshore staffing for energy clients.", to: "/services/recruitment" },
  { icon: Truck, title: "Logistics Support", desc: "Customs clearance, freight forwarding, and on-site delivery.", to: "/services/logistics" },
  { icon: ShieldCheck, title: "Safety & PPE", desc: "Certified PPE, FRC coveralls, and safety equipment supply.", to: "/services/safety" },
  { icon: Anchor, title: "Offshore Support", desc: "Marine equipment, mooring, and offshore platform supplies.", to: "/services/offshore" },
  { icon: Globe2, title: "Vendor Management", desc: "Pre-qualified vendor pool with full contract administration.", to: "/services/vendor-management" },
];

function Home() {
  const [featured, setFeatured] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("products").select("id,name,slug,category,short_description").eq("featured", true).limit(6).then(({ data }) => setFeatured(data ?? []));
  }, []);

  return (
    <>
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-[color:var(--navy-deep)]">
        <img src={heroImg} alt="Offshore oil and gas drilling rig" width={1920} height={1080} className="absolute inset-0 h-full w-full object-cover opacity-40" fetchPriority="high" />
        <div className="absolute inset-0 bg-gradient-to-r from-[color:var(--navy-deep)] via-[color:var(--navy-deep)]/80 to-transparent" />
        <div className="container-x relative grid min-h-[88vh] items-center py-24">
          <div className="max-w-3xl">
            <span className="eyebrow text-[color:var(--gold)]">Trusted Energy-Sector Partner</span>
            <h1 className="mt-4 text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl">
              Powering industry through <span className="text-[color:var(--gold)]">precision sourcing</span> and skilled manpower.
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-white/80">
              OJEX Oil and Gas Services delivers end-to-end procurement, equipment supply, base oil distribution, logistics, and oilfield manpower for energy operators across West Africa.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/quote" className="btn-gold">Request a Quote <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/services" className="btn-outline-gold">Our Services</Link>
            </div>
            <div className="mt-12 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-8">
              <Stat n="500+" l="Items Sourced Annually" />
              <Stat n="24/7" l="Operational Support" />
              <Stat n="15+" l="Industries Served" />
            </div>
          </div>
        </div>
      </section>

      {/* INTRO */}
      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow">Who We Are</span>
            <h2 className="mt-3 text-4xl font-bold sm:text-5xl">A single source for energy-sector procurement and manpower.</h2>
            <p className="mt-5 text-lg text-muted-foreground">
              From drilling consumables and shale shakers to bulk diesel and certified offshore crews, OJEX is the trusted procurement and manpower partner for upstream operators, EPC contractors, and industrial clients across Nigeria, West Africa, and beyond.
            </p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {["API & ISO-aligned vendors","Local content compliance","Rapid expediting","Multi-currency procurement","Bonded warehousing","HSE-first delivery"].map((x) => (
                <li key={x} className="flex items-start gap-2 text-sm"><CheckCircle2 className="mt-0.5 h-5 w-5 text-[color:var(--gold)]" />{x}</li>
              ))}
            </ul>
            <Link to="/about" className="btn-navy mt-8">More about OJEX</Link>
          </div>
          <div className="relative">
            <img src={equipmentImg} alt="Oilfield engineers inspecting equipment" loading="lazy" width={1280} height={800} className="rounded-lg shadow-2xl" />
            <div className="absolute -bottom-6 -left-6 hidden rounded-lg bg-[color:var(--navy-deep)] p-6 text-white shadow-2xl sm:block">
              <p className="text-3xl font-bold text-[color:var(--gold)]">RC Registered</p>
              <p className="text-xs uppercase tracking-widest text-white/80">Nigerian-incorporated company</p>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="section bg-secondary">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">What We Do</span>
              <h2 className="mt-3 text-4xl font-bold">Core services</h2>
            </div>
            <Link to="/services" className="text-sm font-semibold uppercase tracking-widest text-[color:var(--navy)] hover:text-[color:var(--gold)]">View all services →</Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {SERVICES.map((s) => (
              <Link key={s.title} to={s.to} className="card-elevated group">
                <s.icon className="h-9 w-9 text-[color:var(--gold)]" />
                <h3 className="mt-4 text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-[color:var(--navy)] group-hover:text-[color:var(--gold)]">Learn more <ArrowRight className="h-3 w-3" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* DIESEL */}
      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <img src={dieselImg} alt="Bulk diesel and base oil drums" loading="lazy" width={1280} height={800} className="rounded-lg shadow-xl" />
          <div>
            <span className="eyebrow">Energy Supply</span>
            <h2 className="mt-3 text-4xl font-bold">Bulk diesel & base oil supply</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Reliable supply of AGO/diesel, base oils (SN 150 / SN 500), and lubricants for industrial sites, marine operators, and power facilities. Quality-certified, traceable, and delivered on schedule.
            </p>
            <Link to="/services/diesel" className="btn-navy mt-6">Diesel & base oil</Link>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section bg-secondary">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="eyebrow">Catalog</span>
              <h2 className="mt-3 text-4xl font-bold">Featured equipment</h2>
            </div>
            <Link to="/products" className="text-sm font-semibold uppercase tracking-widest hover:text-[color:var(--gold)]">Browse all →</Link>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <Link key={p.id} to="/products/$slug" params={{ slug: p.slug }} className="card-elevated group">
                <span className="text-xs font-semibold uppercase tracking-widest text-[color:var(--gold)]">{p.category}</span>
                <h3 className="mt-2 text-lg font-bold">{p.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.short_description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest group-hover:text-[color:var(--gold)]">Details <ArrowRight className="h-3 w-3" /></span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RECRUITMENT */}
      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <span className="eyebrow">Manpower Solutions</span>
            <h2 className="mt-3 text-4xl font-bold">Skilled crews for offshore, drilling, and engineering.</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              From OPITO-certified offshore crews to senior drilling engineers and HSE leads, OJEX recruits and manages technical talent for the most demanding operations.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/careers" className="btn-gold">Open Positions</Link>
              <Link to="/services/recruitment" className="btn-outline-gold !text-[color:var(--navy)] !border-[color:var(--navy)] hover:!bg-[color:var(--navy)] hover:!text-white">Hire Manpower</Link>
            </div>
          </div>
          <img src={manpowerImg} alt="Offshore crew on platform helideck" loading="lazy" width={1280} height={800} className="rounded-lg shadow-xl" />
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="section bg-[color:var(--navy-deep)] text-white">
        <div className="container-x">
          <span className="eyebrow">Industries Served</span>
          <h2 className="mt-3 text-4xl font-bold">Trusted across the energy value chain.</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {INDUSTRIES.map((i) => (
              <div key={i.name} className="border-l-2 border-[color:var(--gold)] pl-5">
                <h3 className="text-lg font-bold text-white">{i.name}</h3>
                <p className="mt-2 text-sm text-white/70">{i.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-x">
          <div className="rounded-2xl bg-gradient-to-br from-[color:var(--navy)] to-[color:var(--navy-deep)] p-10 text-center text-white sm:p-16">
            <h2 className="text-3xl font-bold sm:text-5xl">Ready to source smarter?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-white/70">Tell us what you need — equipment, fuel, or crew — and our team will respond within 24 hours.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/quote" className="btn-gold">Request a Quote</Link>
              <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-outline-gold">Chat on WhatsApp</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ n, l }: { n: string; l: string }) {
  return (
    <div>
      <p className="text-3xl font-bold text-[color:var(--gold)] sm:text-4xl">{n}</p>
      <p className="mt-1 text-xs uppercase tracking-widest text-white/80">{l}</p>
    </div>
  );
}
