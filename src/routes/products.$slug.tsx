import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { ChevronLeft } from "lucide-react";

export const Route = createFileRoute("/products/$slug")({
  component: ProductDetail,
});

function ProductDetail() {
  const { slug } = Route.useParams();
  const [p, setP] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.from("products").select("*").eq("slug", slug).maybeSingle().then(({ data }) => { setP(data); setLoading(false); });
  }, [slug]);

  if (loading) return <div className="container-x py-20 text-center text-muted-foreground">Loading…</div>;
  if (!p) return (
    <div className="container-x py-20 text-center">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <Link to="/products" className="btn-navy mt-6 inline-flex">Back to catalog</Link>
    </div>
  );

  return (
    <>
      <section className="bg-[color:var(--navy-deep)] py-16 text-white">
        <div className="container-x">
          <Link to="/products" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-[color:var(--gold)]"><ChevronLeft className="h-4 w-4" />Catalog</Link>
          <span className="eyebrow mt-4">{p.category}</span>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{p.name}</h1>
          <p className="mt-4 max-w-3xl text-lg text-white/70">{p.short_description}</p>
        </div>
      </section>
      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="text-xl font-bold">Description</h2>
              <p className="mt-3 text-muted-foreground">{p.description ?? p.short_description}</p>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              <Info k="SKU" v={p.sku ?? "—"} />
              <Info k="Manufacturer" v={p.manufacturer ?? "OEM Partner"} />
              <Info k="Availability" v={p.in_stock ? "In stock / lead time on request" : "Made to order"} />
              <Info k="Brochure" v={p.brochure_url ? <a className="text-[color:var(--gold)]" href={p.brochure_url} target="_blank" rel="noreferrer">Download PDF</a> : "On request"} />
            </dl>
          </div>
          <aside className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-lg font-bold">Request a quote</h3>
            <p className="mt-1 text-sm text-muted-foreground">Get pricing & lead time within 24 hours.</p>
            <div className="mt-4"><QuoteForm defaultProduct={p.name} /></div>
          </aside>
        </div>
      </section>
    </>
  );
}

function Info({ k, v }: { k: string; v: any }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{k}</dt>
      <dd className="mt-1 text-sm font-semibold">{v}</dd>
    </div>
  );
}
