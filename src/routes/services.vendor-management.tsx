import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/services/vendor-management")({
  component: () => (
    <ServicePage
      eyebrow="Vendor Management"
      title="One PO, hundreds of vetted suppliers."
      subtitle="Consolidate your supplier base. We manage prequalification, performance, and compliance."
      intro="Operators work with thousands of vendors. OJEX consolidates that complexity — we prequalify suppliers, manage NCDMB and local-content compliance, track performance KPIs, and deliver a single accountable interface for procurement teams."
      bullets={[
        "Supplier prequalification and audits",
        "NCDMB and Nigerian local-content compliance",
        "KPI tracking: OTIF, quality, cost",
        "Single PO, single invoice, single point of contact",
        "Vendor performance reporting",
        "Risk management and contingency sourcing",
      ]}
      cta={{ label: "Are you a supplier?", to: "/vendor-registration" }}
    />
  ),
  head: () => ({
    meta: [
      { title: `Vendor Management — ${SITE.name}` },
      { name: "description", content: "Consolidated vendor management, prequalification, NCDMB compliance, and supplier performance tracking." },
      { property: "og:title", content: "Vendor Management — OJEX" },
      { property: "og:description", content: "One accountable interface for your full supplier base." },
      { property: "og:url", content: "/services/vendor-management" },
    ],
    links: [{ rel: "canonical", href: "/services/vendor-management" }],
  }),
});
