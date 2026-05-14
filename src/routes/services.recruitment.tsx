import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/services/recruitment")({
  component: () => (
    <ServicePage
      eyebrow="Manpower & Recruitment"
      title="Skilled oilfield manpower, on demand."
      subtitle="Drilling crews, technicians, engineers, and offshore personnel — fully vetted and certified."
      intro="OJEX maintains a database of pre-screened oilfield professionals across drilling, completions, production, marine, HSE, and engineering. We handle sourcing, certification verification, mobilisation, and payroll so you focus on operations."
      bullets={[
        "Drilling crews: drillers, derrickmen, floormen, motormen",
        "Technical: instrumentation, electrical, mechanical, welders",
        "Engineers: drilling, completions, production, reservoir",
        "HSE officers, medics, and safety personnel",
        "Marine crew and offshore personnel",
        "Full mobilisation, payroll, and compliance management",
      ]}
      cta={{ label: "Hiring or applying?", to: "/careers" }}
    />
  ),
  head: () => ({
    meta: [
      { title: `Manpower & Recruitment — ${SITE.name}` },
      { name: "description", content: "Vetted oilfield manpower: drilling crews, engineers, technicians, HSE, and offshore personnel." },
      { property: "og:title", content: "Manpower & Recruitment — OJEX" },
      { property: "og:description", content: "Skilled oil & gas personnel sourcing, vetting, and mobilisation." },
      { property: "og:url", content: "/services/recruitment" },
    ],
    links: [{ rel: "canonical", href: "/services/recruitment" }],
  }),
});
