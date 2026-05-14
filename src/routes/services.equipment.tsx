import { createFileRoute } from "@tanstack/react-router";
import { ServicePage } from "@/components/ServicePage";
import { SITE } from "@/lib/site";

export const Route = createFileRoute("/services/equipment")({
  component: () => (
    <ServicePage
      eyebrow="Industrial Equipment Supply"
      title="Drilling, marine, and industrial equipment."
      subtitle="Shale shakers, mud cleaners, screens, pumps, valves, and complete drilling packages."
      intro="We supply new and refurbished oilfield equipment from leading global manufacturers. Whether you need replacement shaker screens or a complete solids-control package, OJEX delivers to spec, on schedule, with full documentation."
      bullets={[
        "Shale shakers, mud cleaners, desanders, desilters",
        "OEM and aftermarket shaker screens (all major brands)",
        "Mud pumps, BOPs, valves, manifolds, and spares",
        "Industrial vehicles, generators, and marine equipment",
        "Full warranty and after-sales technical support",
        "On-site commissioning available",
      ]}
    />
  ),
  head: () => ({
    meta: [
      { title: `Industrial Equipment Supply — ${SITE.name}` },
      { name: "description", content: "Drilling equipment, shale shakers, mud cleaners, screens, marine and industrial equipment supply." },
      { property: "og:title", content: "Industrial Equipment Supply — OJEX" },
      { property: "og:description", content: "OEM and certified aftermarket equipment for drilling and offshore operations." },
      { property: "og:url", content: "/services/equipment" },
    ],
    links: [{ rel: "canonical", href: "/services/equipment" }],
  }),
});
