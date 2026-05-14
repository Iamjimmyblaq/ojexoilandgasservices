import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/services/procurement")({
  component: () => (
    <ServicePage
      eyebrow="Procurement & Sourcing"
      title="Strategic procurement for the energy sector."
      subtitle="From single-line orders to full project sourcing — managed end to end."
      intro="OJEX operates as an extension of your procurement desk. We source vetted OEM and aftermarket equipment, consumables, chemicals, and spares from a global supplier network, then manage QA, expediting, packing, and delivery to your site."
      bullets={[
        "Global supplier network across US, Europe, China, UAE, and India",
        "OEM-original and certified aftermarket sourcing",
        "RFQ to PO turnaround within 24–72 hours",
        "Expediting, inspection, and quality assurance",
        "Consolidated freight and customs clearance",
        "Transparent pricing with full traceability",
      ]}
    />
  ),
  head: () => ({
    meta: [
      { title: `Procurement & Sourcing — ${SITE.name}` },
      { name: "description", content: "Strategic oil & gas procurement: OEM sourcing, expediting, QA, freight, and customs clearance." },
      { property: "og:title", content: "Procurement & Sourcing — OJEX" },
      { property: "og:description", content: "End-to-end procurement for upstream, midstream, and downstream operators." },
      { property: "og:url", content: "/services/procurement" },
    ],
    links: [{ rel: "canonical", href: "/services/procurement" }],
  }),
});
