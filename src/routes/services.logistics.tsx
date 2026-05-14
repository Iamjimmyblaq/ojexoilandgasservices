import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/services/logistics")({
  component: () => (
    <ServicePage
      eyebrow="Logistics Support"
      title="Move equipment safely, cost-effectively, on schedule."
      subtitle="Inland haulage, freight forwarding, customs clearance, and warehousing."
      intro="OJEX manages the full logistics chain from supplier door to your operational site — international freight, Nigerian customs clearance at Apapa and PH, inland haulage, and short- to medium-term warehousing."
      bullets={[
        "Sea, air, and road freight coordination",
        "Customs clearance at Apapa, Tin Can, and Onne",
        "Heavy-haul and abnormal-load transport",
        "Bonded and general warehousing",
        "Project cargo and over-dimensional shipments",
        "Real-time shipment tracking and reporting",
      ]}
    />
  ),
  head: () => ({
    meta: [
      { title: `Logistics Support — ${SITE.name}` },
      { name: "description", content: "Freight forwarding, customs clearance, inland haulage, and warehousing for oil & gas cargo." },
      { property: "og:title", content: "Logistics Support — OJEX" },
      { property: "og:description", content: "End-to-end logistics for oilfield equipment and project cargo." },
      { property: "og:url", content: "/services/logistics" },
    ],
    links: [{ rel: "canonical", href: "/services/logistics" }],
  }),
});
