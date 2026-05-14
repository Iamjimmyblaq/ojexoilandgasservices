import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PRODUCT_CATEGORIES, SITE } from "@/lib/site";
import { Search } from "lucide-react";

export const Route = createFileRoute("/products")({
  component: Products,
  head: () => ({
    meta: [
      { title: `Products Catalog — ${SITE.name}` },
      { name: "description", content: "Browse industrial equipment, drilling tools, PPE, marine equipment, base oil & diesel, and more." },
      { property: "og:title", content: "Products Catalog — OJEX" },
      { property: "og:url", content: "/products" },
    ],
    links: [{ rel: "canonical", href: "/products" }],
  }),
});

function Products() {
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  useEffect(() => {
    supabase.from("products").select("*").eq("active", true).order("featured", { ascending: false }).then(({ data }) => setItems(data ?? []));
  }, []);

  const filtered = useMemo(() => items.filter(p =>
    (cat === "all" || p.category === cat) &&
    (q === "" || (p.name + " " + p.short_description).toLowerCase().includes(q.toLowerCase()))
  ), [items, q, cat]);

  return (
    <>
      <PageHero eyebrow="Catalog" title="Industrial products & equipment." subtitle="From shale shakers and drill bits to PPE and bulk diesel — sourced, certified, and ready to ship." />
      <section className="section">
        <div className="container-x">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="w-full rounded-md border border-input bg-card py-2.5 pl-10 pr-3 text-sm focus:border-[color:var(--gold)] focus:outline-none" />
            </div>
            <select value={cat} onChange={(e) => setCat(e.target.value)} className="rounded-md border border-input bg-card px-3 py-2.5 text-sm focus:border-[color:var(--gold)] focus:outline-none">
              <option value="all">All categories</option>
              {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((p) => (
              <Link key={p.id} to="/products/$slug" params={{ slug: p.slug }} className="card-elevated group">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-widest text-[color:var(--gold)]">{p.category}</span>
                  {p.featured && <span className="rounded-full bg-[color:var(--gold)]/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-[color:var(--navy-deep)]">Featured</span>}
                </div>
                <h3 className="mt-3 text-lg font-bold">{p.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{p.short_description}</p>
                <p className="mt-4 text-xs text-muted-foreground">SKU: {p.sku ?? "—"}</p>
              </Link>
            ))}
            {filtered.length === 0 && <p className="col-span-full text-center text-muted-foreground">No products match your search.</p>}
          </div>
        </div>
      </section>
    </>
  );
}
