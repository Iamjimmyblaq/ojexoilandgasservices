import { createFileRoute } from "@tanstack/react-router";
import { PageHero } from "@/components/PageHero";
import { SITE } from "@/lib/site";
import { FAQ_ANSWERS } from "@/lib/seo-answers";

const FAQS = FAQ_ANSWERS;

export const Route = createFileRoute("/faqs")({
  component: () => (
    <>
      <PageHero
        eyebrow="Help"
        title="Frequently asked questions."
        subtitle="Chemicals, equipment, LPG, fuel, procurement, and manpower — answered."
      />
      <section className="section">
        <div className="container-x mx-auto max-w-3xl space-y-4">
          {FAQS.map((f, i) => (
            <details key={i} className="group rounded-lg border border-border bg-card p-5 transition-all open:shadow-md">
              <summary className="cursor-pointer list-none text-base font-semibold marker:hidden">
                {f.q}
                <span className="float-right text-[color:var(--gold)] transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  ),
  head: () => ({
    meta: [
      { title: `FAQs — Chemicals, Equipment, LPG & Manpower | ${SITE.name}` },
      {
        name: "description",
        content:
          "Answers on drilling & completion chemicals (barite, mica, HEC liquid, calcium bromide), PPE, LPG skids, base oil & diesel, shale shakers, valves, and manpower supply in Nigeria.",
      },
      { property: "og:title", content: "OJEX FAQs — Chemicals, Equipment, LPG & Manpower in Nigeria" },
      {
        property: "og:description",
        content: "Lead times, certification, credit terms, vendor onboarding, and what OJEX supplies across Nigeria and West Africa.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://www.ojexoilandgasservices.com/faqs" },
    ],
    links: [{ rel: "canonical", href: "https://www.ojexoilandgasservices.com/faqs" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
});
