import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/services/safety")({
  component: () => (
    <ServicePage
      eyebrow="Safety Equipment"
      title="Certified PPE and safety equipment."
      subtitle="Coveralls, helmets, gloves, boots, gas detectors, fire-fighting, and rescue gear."
      intro="OJEX supplies internationally certified personal protective equipment and safety systems. We carry inventory in Port Harcourt for rapid dispatch and source specialist gear (SCBA, fall arrest, H2S monitors) on demand."
      bullets={[
        "FR coveralls, safety helmets, gloves, boots",
        "Gas detectors: H2S, O2, LEL, multi-gas",
        "SCBA, EEBD, and respiratory protection",
        "Fire-fighting equipment and extinguishers",
        "Fall arrest, harnesses, and rescue equipment",
        "Eye, ear, and face protection — bulk and individual",
      ]}
    />
  ),
  head: () => ({
    meta: [
      { title: `Safety Equipment — ${SITE.name}` },
      { name: "description", content: "Certified PPE, gas detectors, fire-fighting, and rescue equipment for oil & gas operations." },
      { property: "og:title", content: "Safety Equipment — OJEX" },
      { property: "og:description", content: "PPE and safety systems certified to international standards." },
      { property: "og:url", content: "/services/safety" },
    ],
    links: [{ rel: "canonical", href: "/services/safety" }],
  }),
});
