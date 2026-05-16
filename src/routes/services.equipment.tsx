import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { SERVICES } from "@/lib/services-data";
import { SITE } from "@/lib/site";

const S = SERVICES.equipment;
export const Route = createFileRoute("/services/equipment")({
  component: () => <ServicePage service={S} />,
  head: () => ({
    meta: [
      { title: `${S.eyebrow} — ${SITE.name}` },
      { name: "description", content: S.layman },
      { property: "og:title", content: `${S.eyebrow} — OJEX` },
      { property: "og:description", content: S.subtitle },
      { property: "og:url", content: `/services/${S.slug}` },
    ],
    links: [{ rel: "canonical", href: `/services/${S.slug}` }],
  }),
});
