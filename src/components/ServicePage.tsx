import { PageHero } from "@/components/PageHero";
import { Link } from "@tanstack/react-router";
import { SITE } from "@/lib/site";

export interface ServicePageProps {
  eyebrow: string;
  title: string;
  subtitle: string;
  intro: string;
  bullets: string[];
  cta?: { label: string; to: string };
}

export function ServicePage({ eyebrow, title, subtitle, intro, bullets, cta }: ServicePageProps) {
  return (
    <>
      <PageHero eyebrow={eyebrow} title={title} subtitle={subtitle} />
      <section className="section">
        <div className="container-x grid gap-12 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <p className="text-lg text-muted-foreground">{intro}</p>
            <ul className="grid gap-3 sm:grid-cols-2">
              {bullets.map((b) => (
                <li key={b} className="rounded-md border border-border bg-card p-4 text-sm">
                  <span className="mr-2 text-[color:var(--gold)]">▸</span>{b}
                </li>
              ))}
            </ul>
          </div>
          <aside className="rounded-lg bg-[color:var(--navy-deep)] p-8 text-white">
            <h3 className="text-xl font-bold">{cta?.label ?? "Need a quote?"}</h3>
            <p className="mt-2 text-sm text-white/70">Send us your specifications and we'll respond within 24 hours.</p>
            <Link to={cta?.to ?? "/quote"} className="btn-gold mt-6 w-full">Request a Quote</Link>
            <a href={SITE.whatsapp} target="_blank" rel="noopener noreferrer" className="btn-outline-gold mt-3 w-full">WhatsApp Us</a>
          </aside>
        </div>
      </section>
    </>
  );
}
