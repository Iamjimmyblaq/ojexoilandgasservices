import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { SERVICES } from "@/lib/services-data";
import { SITE } from "@/lib/site";

const S = SERVICES.chemicals;
export const Route = createFileRoute("/services/chemicals")({
  component: () => <ServicePage service={S} />,
  head: () => ({
    meta: [
      { title: `${S.eyebrow} — ${SITE.name}` },
      { name: "description", content: S.layman },
      { property: "og:title", content: `${S.eyebrow} — OJEX` },
      { property: "og:description", content: S.subtitle },
      { property: "og:url", content: `https://www.ojexoilandgasservices.com/services/${S.slug}` },
    ],
    links: [{ rel: "canonical", href: `https://www.ojexoilandgasservices.com/services/${S.slug}` }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: (S.faqs ?? []).map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
});
