import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { BackButton } from "@/components/BackButton";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";

export const Route = createFileRoute("/products/$slug")({
  component: ProductDetail,
});

interface Product {
  id: string; name: string; slug: string; category: string; sku?: string | null;
  short_description?: string | null; description?: string | null; manufacturer?: string | null;
  image_url?: string | null; gallery_urls?: string[] | null; brochure_url?: string | null; in_stock?: boolean;
}

function ProductDetail() {
  const { slug } = Route.useParams();
  const [p, setP] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    supabase.from("products").select("*").eq("slug", slug).maybeSingle().then(({ data }) => {
      setP(data as Product | null); setLoading(false); setActiveIdx(0);
    });
  }, [slug]);

  // Keyboard nav for lightbox
  useEffect(() => {
    if (!lightbox) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setActiveIdx((i) => (i + 1) % gallery.length);
      if (e.key === "ArrowLeft") setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightbox, p]);

  if (loading) return <div className="container-x py-20 text-center text-muted-foreground">Loading…</div>;
  if (!p) return (
    <div className="container-x py-20 text-center">
      <h1 className="text-2xl font-bold">Product not found</h1>
      <Link to="/products" className="btn-navy mt-6 inline-flex">Back to catalog</Link>
    </div>
  );

  const gallery = (p.gallery_urls && p.gallery_urls.length > 0
    ? p.gallery_urls
    : p.image_url ? [p.image_url] : []) as string[];
  const activeImg = gallery[activeIdx] ?? p.image_url ?? "";

  return (
    <>
      <section className="bg-[color:var(--navy-deep)] py-12 text-white">
        <div className="container-x">
          <BackButton className="mb-5" />
          <Link to="/products" className="inline-flex items-center gap-1 text-sm text-white/70 hover:text-[color:var(--gold)]">
            <ChevronLeft className="h-4 w-4" />Catalog
          </Link>
          <span className="eyebrow mt-4">{p.category}</span>
          <h1 className="mt-3 text-4xl font-bold sm:text-5xl">{p.name}</h1>
          {p.short_description && <p className="mt-4 max-w-3xl text-lg text-white/70">{p.short_description}</p>}
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          {/* Gallery */}
          <div>
            <div
              className="group relative aspect-[4/3] cursor-zoom-in overflow-hidden rounded-lg border border-border bg-muted"
              onClick={() => gallery.length > 0 && setLightbox(true)}
            >
              {activeImg ? (
                <>
                  <img src={activeImg} alt={p.name} className="h-full w-full object-cover" />
                  <div className="absolute inset-0 grid place-items-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
                    <ZoomIn className="h-10 w-10 text-white" />
                  </div>
                  {gallery.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length); }}
                        className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-foreground shadow hover:bg-white"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setActiveIdx((i) => (i + 1) % gallery.length); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-foreground shadow hover:bg-white"
                        aria-label="Next image"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </>
              ) : (
                <div className="grid h-full place-items-center text-sm text-muted-foreground">No image available</div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="mt-4 grid grid-cols-4 gap-2">
                {gallery.map((url, i) => (
                  <button
                    key={url + i}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={`aspect-square overflow-hidden rounded-md border-2 transition ${i === activeIdx ? "border-[color:var(--gold)]" : "border-border opacity-70 hover:opacity-100"}`}
                  >
                    <img src={url} alt={`${p.name} ${i + 1}`} loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold">Description</h2>
              <p className="mt-3 text-muted-foreground">{p.description ?? p.short_description ?? "Contact us for full specifications and datasheet."}</p>
            </div>
            <dl className="grid gap-3 sm:grid-cols-2">
              <Info k="SKU" v={p.sku ?? "—"} />
              <Info k="Manufacturer" v={p.manufacturer ?? "OEM Partner"} />
              <Info k="Availability" v={p.in_stock ? "In stock / lead time on request" : "Made to order"} />
              <Info k="Brochure" v={p.brochure_url ? <a className="text-[color:var(--gold-deep)] underline" href={p.brochure_url} target="_blank" rel="noreferrer">Download PDF</a> : "On request"} />
            </dl>
          </div>
        </div>
      </section>

      {/* Quote form */}
      <section className="section bg-muted/30">
        <div className="container-x mx-auto max-w-3xl">
          <div className="mb-6 text-center">
            <span className="eyebrow">RFQ</span>
            <h2 className="mt-2 text-3xl font-bold">Request a quote for this product</h2>
            <p className="mt-2 text-muted-foreground">Get pricing &amp; lead time within 24 hours.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
            <QuoteForm defaultProduct={p.name} />
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && activeImg && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/95 p-4"
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setLightbox(false); }}
            className="absolute right-5 top-5 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          {gallery.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveIdx((i) => (i - 1 + gallery.length) % gallery.length); }}
                className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setActiveIdx((i) => (i + 1) % gallery.length); }}
                className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <img
            src={activeImg}
            alt={p.name}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
          {gallery.length > 1 && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-4 py-1.5 text-xs text-white/80">
              {activeIdx + 1} / {gallery.length}
            </div>
          )}
        </div>
      )}
    </>
  );
}

function Info({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <dt className="text-xs uppercase tracking-widest text-muted-foreground">{k}</dt>
      <dd className="mt-1 text-sm font-semibold">{v}</dd>
    </div>
  );
}
