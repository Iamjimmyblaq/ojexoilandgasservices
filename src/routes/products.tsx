import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_CATEGORIES, SITE } from "@/lib/site";
import { Search } from "lucide-react";

const CATEGORY_NOTES: Record<string, string> = {
  "Shale Shakers":
    "Linear and balanced-elliptical motion shakers for solids control, supplied with matched screen decks, motors and spare parts for onshore and offshore rigs.",
  "Mud Cleaners":
    "Desanders, desilters and combined mud cleaners that strip drilled solids from the active system to protect pumps and reduce dilution cost.",
  "Shaker Screens":
    "API RP 13C-designated pretensioned and composite screens for common shaker models, held in stock in the mesh ranges Nigerian operators use most.",
  "Drilling Equipment":
    "Drill bits, handling tools, subs, valves, BOP spares and rotating equipment sourced from OEM and certified aftermarket manufacturers.",
  "Industrial Vehicles":
    "Forklifts, buses, pickups and utility vehicles for site logistics, staff movement and materials handling, delivered with documentation.",
  "Marine Equipment":
    "Mooring ropes, fenders, life-saving appliances, deck fittings and vessel spares for support vessels, barges and jetty operations.",
  "PPE & Safety Wears":
    "Coveralls, FR wear, safety footwear, gloves, helmets, harnesses, gas detection and eye protection meeting EN/ANSI standards.",
  "Industrial Tools":
    "Hand and power tools, torque equipment, lifting gear, measuring instruments and workshop consumables.",
  "Oilfield Consumables":
    "Gaskets, seals, filters, hoses, lubricants and general rig consumables kept on stock cycles to avoid downtime.",
  Chemicals:
    "Drilling, completion and production chemicals — barite, bentonite, CaCO₃, mica, calcium bromide, HEC, oxygen scavengers and inhibitors — with certificates of analysis.",
  "Base Oil/Diesel":
    "AGO, base oils and lubricant feedstock supplied in bulk by truck or vessel, with quality certificates on every delivery.",
  "LPG Skids & Accessories":
    "Skid-mounted LPG storage and dispensing units, tanks, dispensers, valves, hoses and safety accessories for retail and industrial installations.",
};

export const Route = createFileRoute("/products")({
  loader: async () => {
    const { data } = await supabase
      .from("products")
      .select("id,name,slug,category,image_url,gallery_urls,short_description,sku,featured")
      .eq("active", true)
      .order("featured", { ascending: false });
    return { products: data ?? [] };
  },
  component: Products,
  head: ({ loaderData }) => ({
    meta: [
      { title: `Oilfield Equipment, Chemicals & PPE Catalogue — ${SITE.name}` },
      {
        name: "description",
        content:
          "Browse OJEX's Nigerian supply catalogue: shale shakers and screens, mud cleaners, drilling equipment, oilfield chemicals, PPE, marine equipment, LPG skids, base oil and diesel.",
      },
      { property: "og:title", content: "Oilfield Equipment, Chemicals & PPE Catalogue — OJEX" },
      {
        property: "og:description",
        content:
          "Shale shakers, shaker screens, mud cleaners, drilling tools, oilfield chemicals, PPE, marine equipment, LPG skids, base oil and diesel — sourced and delivered across Nigeria.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.ojexoilandgasservices.com/products" },
    ],
    links: [{ rel: "canonical", href: "https://www.ojexoilandgasservices.com/products" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "OJEX Oil and Gas Services product catalogue",
          numberOfItems: loaderData?.products?.length ?? 0,
          itemListElement: (loaderData?.products ?? []).slice(0, 60).map((p: any, i: number) => ({
            "@type": "ListItem",
            position: i + 1,
            url: `https://www.ojexoilandgasservices.com/products/${p.slug}`,
            name: p.name,
          })),
        }),
      },
    ],
  }),
});

function Products() {
  const { products } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const filtered = useMemo(
    () =>
      products.filter(
        (p: any) =>
          (cat === "all" || p.category === cat) &&
          (q === "" || `${p.name} ${p.short_description ?? ""}`.toLowerCase().includes(q.toLowerCase())),
      ),
    [products, q, cat],
  );

  const activeCategories = useMemo(
    () => PRODUCT_CATEGORIES.filter((c) => products.some((p: any) => p.category === c)),
    [products],
  );

  return (
    <>
      <PageHero
        eyebrow="Catalogue"
        title="Industrial products, chemicals & equipment."
        subtitle="From shale shakers and drill bits to oilfield chemicals, PPE and bulk diesel — sourced, certified, and ready to ship."
      />

      <section className="section pb-0">
        <div className="container-x grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold">What we supply and how we supply it</h2>
            <p className="text-muted-foreground">
              OJEX Oil and Gas Services supplies solids-control equipment, drilling tools, oilfield chemicals, personal
              protective equipment, marine spares, LPG skids and bulk fuel to operators, drilling contractors, EPC firms
              and industrial users across Nigeria. Every line item below is either held at our Port Harcourt supply base
              or sourced through vetted OEM and certified aftermarket manufacturers in the US, Europe, China, UAE and
              India.
            </p>
            <p className="text-muted-foreground">
              Each product page lists the specification we quote against, the packaging options available and a direct
              request-for-quote form. If an item is not listed, we still source it — send the part number, drawing or
              datasheet and we revert with pricing, lead time and country of origin, typically within 24–72 hours.
              Chemicals ship with a certificate of analysis and SDS; equipment ships with mill or manufacturer
              certificates where the standard requires it.
            </p>
            <p className="text-muted-foreground">
              Deliveries are made to rig site, jetty, warehouse or project location across Rivers, Delta, Bayelsa, Akwa
              Ibom and Lagos, with offshore transfer arranged through the operator's logistics window.
            </p>
          </div>
          <aside className="space-y-3 rounded-lg border border-border bg-card p-6">
            <h2 className="text-lg font-bold">Buying guidance</h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <strong className="text-foreground">Shaker screens:</strong> quote by shaker model and API mesh
                designation, not micron size.
              </li>
              <li>
                <strong className="text-foreground">Chemicals:</strong> give target density, volume and packaging so we
                quote the right grade.
              </li>
              <li>
                <strong className="text-foreground">PPE:</strong> confirm the standard (EN/ANSI) and size split before
                order.
              </li>
              <li>
                <strong className="text-foreground">Bulk fuel:</strong> state litres, delivery window and discharge
                point.
              </li>
            </ul>
            <Link to="/quote" className="btn-gold inline-flex w-full justify-center">
              Request a quote
            </Link>
          </aside>
        </div>
      </section>

      <section className="section">
        <div className="container-x">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <label htmlFor="product-search" className="sr-only">
                Search products
              </label>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                id="product-search"
                aria-label="Search products"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-md border border-input bg-card py-2.5 pl-10 pr-3 text-sm focus:border-[color:var(--gold)] focus:outline-none"
              />
            </div>
            <label htmlFor="product-category" className="sr-only">
              Filter by category
            </label>
            <select
              id="product-category"
              aria-label="Filter by category"
              value={cat}
              onChange={(e) => setCat(e.target.value)}
              className="rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:border-[color:var(--gold)] focus:outline-none"
            >
              <option value="all">All categories</option>
              {PRODUCT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {cat !== "all" && CATEGORY_NOTES[cat] && (
            <p className="mt-4 rounded-md border-l-4 border-[color:var(--gold)] bg-[color:var(--gold)]/5 p-4 text-sm text-muted-foreground">
              {CATEGORY_NOTES[cat]}
            </p>
          )}

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p: any) => (
              <Link
                key={p.id}
                to="/products/$slug"
                params={{ slug: p.slug }}
                className="card-elevated group overflow-hidden !p-0 flex flex-col"
              >
                <div className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-[color:var(--gold)]">
                      {p.category}
                    </span>
                    {p.featured && (
                      <span className="rounded-full bg-[color:var(--gold)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--navy-deep)]">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="mt-3 text-lg font-bold">{p.name}</h3>
                </div>
                {(p.image_url || (p.gallery_urls && p.gallery_urls[0])) && (
                  <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                    <img
                      src={p.image_url || p.gallery_urls[0]}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex-1 p-5 pt-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">{p.short_description}</p>
                  <p className="mt-4 text-xs text-muted-foreground">SKU: {p.sku ?? "—"}</p>
                </div>
              </Link>
            ))}
            {filtered.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground">No products match your search.</p>
            )}
          </div>
        </div>
      </section>

      <section className="section bg-muted/30">
        <div className="container-x">
          <h2 className="text-2xl font-bold">Categories we stock and source</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(activeCategories.length > 0 ? activeCategories : PRODUCT_CATEGORIES).map((c) => (
              <div key={c} className="rounded-lg border border-border bg-card p-5">
                <h3 className="font-bold">{c}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{CATEGORY_NOTES[c]}</p>
                <button
                  type="button"
                  onClick={() => {
                    setCat(c);
                    setQ("");
                  }}
                  className="mt-3 text-xs font-semibold text-[color:var(--navy)] hover:text-[color:var(--gold)]"
                >
                  Show {c} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
