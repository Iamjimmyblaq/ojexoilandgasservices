import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/services/offshore")({
  component: () => (
    <ServicePage
      eyebrow="Offshore Support"
      title="Offshore-ready supply and crew change support."
      subtitle="Marine spares, deck equipment, provisioning, and crew logistics for offshore assets."
      intro="OJEX supports FPSOs, drillships, jack-ups, and marine support vessels operating offshore Nigeria and the Gulf of Guinea. From mooring spares to galley provisions, we coordinate via Onne and Port Harcourt logistics bases."
      bullets={[
        "Marine spares and deck equipment",
        "Mooring, anchoring, and lifting gear",
        "Provisioning and bonded stores",
        "Crew change and personnel logistics",
        "Helicopter and crew-boat coordination",
        "Onne base operations and supply runs",
      ]}
    />
  ),
  head: () => ({
    meta: [
      { title: `Offshore Support — ${SITE.name}` },
      { name: "description", content: "Offshore supply, marine spares, provisioning, and crew change support for FPSOs and rigs." },
      { property: "og:title", content: "Offshore Support — OJEX" },
      { property: "og:description", content: "Integrated offshore supply chain via Onne and Port Harcourt." },
      { property: "og:url", content: "/services/offshore" },
    ],
    links: [{ rel: "canonical", href: "/services/offshore" }],
  }),
});
