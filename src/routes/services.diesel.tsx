import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/services/diesel")({
  component: () => (
    <ServicePage
      eyebrow="Base Oil & Diesel Supply"
      title="Reliable bulk fuel and base oil distribution."
      subtitle="AGO, DPK, base oils, and lubricants supplied to rigs, plants, and industrial sites."
      intro="OJEX maintains supply contracts with major Nigerian depots and refineries to deliver Automotive Gas Oil (diesel), base oils (SN150, SN500, SN900), and industrial lubricants in bulk — anywhere in Nigeria, on time."
      bullets={[
        "Automotive Gas Oil (AGO / Diesel) — bulk delivery",
        "Base oils: SN150, SN500, SN900, BS150",
        "Industrial lubricants and greases",
        "Calibrated bulk trucks with metered delivery",
        "Quality certificates from accredited labs",
        "24/7 emergency fuel supply for rigs and plants",
      ]}
    />
  ),
  head: () => ({
    meta: [
      { title: `Base Oil & Diesel Supply — ${SITE.name}` },
      { name: "description", content: "Bulk AGO diesel, base oils, and industrial lubricants delivered across Nigeria." },
      { property: "og:title", content: "Base Oil & Diesel Supply — OJEX" },
      { property: "og:description", content: "Reliable bulk fuel distribution for rigs, plants, and industrial sites." },
      { property: "og:url", content: "/services/diesel" },
    ],
    links: [{ rel: "canonical", href: "/services/diesel" }],
  }),
});
