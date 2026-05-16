import { PageHero } from "@/components/PageHero";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { QuoteForm } from "@/components/forms/QuoteForm";
import { SITE } from "@/lib/site";
import { ArrowRight, Sparkles } from "lucide-react";
import type { ServiceDef } from "@/lib/services-data";

export function ServicePage({ service }: { service: ServiceDef }) {
  const { data: products } = useQuery({
    queryKey: ["service-products", service.slug],
    enabled: service.categories.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id,name,slug,category,image_url,short_description")
        .in("category", service.categories)
        .eq("active", true)
        .order("featured", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  return (
    <>
      <PageHero eyebrow={service.eyebrow} title={service.title} subtitle={service.subtitle} />

      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-lg border-l-4 border-[color:var(--gold)] bg-[color:var(--gold)]/5 p-5">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-[color:var(--gold-deep)]" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-[color:var(--gold-deep)]">In Plain English</p>
                  <p className="mt-1.5 text-base leading-relaxed text-foreground">{service.layman}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold">The full picture</h2>
              <p className="mt-3 text-muted-foreground">{service.intro}</p>
            </div>

            <div>
              <h3 className="text-lg font-bold">What's included</h3>
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {service.bullets.map((b) => (
                  <li key={b} className="rounded-md border border-border bg-card p-4 text-sm">
                    <span className="mr-2 text-[color:var(--gold)]">▸</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start space-y-4 rounded-lg bg-[color:var(--navy-deep)] p-8 text-white">
            <h3 className="text-xl font-bold">Need a quote?</h3>
            <p className="text-sm text-white/70">Send us your specifications and we'll respond within 24 hours.</p>
            <a href="#quote-form" className="btn-gold w-full">Request a Quote</a>
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-outline-gold w-full">WhatsApp Us</a>
            <div className="mt-4 border-t border-white/10 pt-4 text-xs text-white/60">
              <div>📞 {SITE.phone}</div>
              <div className="mt-1">✉ {SITE.email}</div>
            </div>
          </aside>
        </div>
      </section>

      {service.categories.length > 0 && (
        <section className="section bg-muted/30">
          <div className="container-x">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Featured supply</span>
                <h2 className="mt-2 text-3xl font-bold">Products in this category</h2>
                <p className="mt-2 text-muted-foreground">Browse what we stock and source. Click any item for specifications and a direct RFQ.</p>
              </div>
              <Link to="/products" className="hidden text-sm font-semibold text-[color:var(--navy)] hover:text-[color:var(--gold)] sm:inline-flex">
                View full catalog →
              </Link>
            </div>
            {products && products.length > 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <Link
                    key={p.id}
                    to="/products/$slug"
                    params={{ slug: p.slug }}
                    className="group block overflow-hidden rounded-lg border border-border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-muted">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.name}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-xs text-muted-foreground">No image</div>
                      )}
                    </div>
                    <div className="p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-widest text-[color:var(--gold-deep)]">{p.category}</p>
                      <h3 className="mt-1.5 line-clamp-2 font-bold leading-tight">{p.name}</h3>
                      {p.short_description && <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">{p.short_description}</p>}
                      <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-[color:var(--navy)] group-hover:text-[color:var(--gold)]">
                        View details <ArrowRight className="h-3 w-3" />
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border bg-card p-10 text-center text-sm text-muted-foreground">
                Catalog updates coming. <Link to="/quote" className="text-[color:var(--gold-deep)] underline">Request a custom quote</Link> in the meantime.
              </div>
            )}
          </div>
        </section>
      )}

      <section id="quote-form" className="section">
        <div className="container-x mx-auto max-w-3xl">
          <div className="mb-6 text-center">
            <span className="eyebrow">RFQ</span>
            <h2 className="mt-2 text-3xl font-bold">Request a quote for {service.eyebrow}</h2>
            <p className="mt-2 text-muted-foreground">Fill out the form below — our team responds within 24 hours.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6 sm:p-8">
            <QuoteForm defaultProduct={service.eyebrow} />
          </div>
        </div>
      </section>
    </>
  );
}
