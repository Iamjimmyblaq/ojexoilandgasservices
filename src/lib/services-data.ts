import lpgSkidImage from "@/assets/lpg-skid.jpg";

export interface ServiceDef {
  slug: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  layman: string;
  intro: string;
  bullets: string[];
  categories: string[]; // product categories shown on this service page
  heroImage?: string;
  steps?: { title: string; body: string }[];
}

export const SERVICES: Record<string, ServiceDef> = {
  procurement: {
    slug: "procurement",
    eyebrow: "Procurement & Sourcing",
    title: "Strategic procurement for the energy sector.",
    subtitle: "From single-line orders to full project sourcing — managed end to end.",
    layman:
      "In simple terms: tell us what part, tool, or material you need — we find the best supplier worldwide, check the quality, and deliver it to your site. You skip the hassle of dealing with dozens of vendors.",
    intro:
      "OJEX operates as an extension of your procurement desk. We source vetted OEM and aftermarket equipment, consumables, chemicals, and spares from a global supplier network, then manage QA, expediting, packing, and delivery to your site.",
    bullets: [
      "Global supplier network: US, Europe, China, UAE, India",
      "OEM-original and certified aftermarket sourcing",
      "RFQ to PO turnaround within 24–72 hours",
      "Expediting, inspection, and quality assurance",
      "Consolidated freight and customs clearance",
      "Transparent pricing with full traceability",
    ],
    categories: ["Drilling Equipment", "Industrial Tools", "Oilfield Consumables", "Chemicals"],
  },
  equipment: {
    slug: "equipment",
    eyebrow: "Industrial Equipment Supply",
    title: "Drilling and oilfield equipment supply.",
    subtitle: "Shale shakers, mud cleaners, drill bits, valves, and the spares that keep them running.",
    layman:
      "In simple terms: we supply the big machines and tools used on rigs and oil sites — shale shakers, drill bits, valves, wrenches — both brand-new and replacement parts.",
    intro:
      "Direct supply of drilling solids control equipment, downhole tools, pipeline valves, and industrial spares from leading manufacturers. We hold consignment stock for high-volume consumables and provide rapid response for urgent needs.",
    bullets: [
      "Shale shakers, mud cleaners, desanders, desilters",
      "PDC and roller-cone drill bits",
      "API shaker screens (all mesh sizes)",
      "Industrial valves, pumps, and fittings",
      "Hydraulic tools, torque wrenches, lifting gear",
      "OEM-original spare parts and rebuild kits",
    ],
    categories: ["Shale Shakers", "Mud Cleaners", "Shaker Screens", "Drilling Equipment", "Industrial Tools"],
  },
  diesel: {
    slug: "diesel",
    eyebrow: "Base Oil & Diesel Supply",
    title: "Bulk fuel and lubricant distribution.",
    subtitle: "AGO, base oil, lubricants — reliably delivered to rigs, plants, and depots.",
    layman:
      "In simple terms: we deliver diesel fuel and lubricating oils in bulk to power your rigs, generators, trucks, and machinery — on time, with quality you can trust.",
    intro:
      "Reliable, on-spec bulk supply of AGO/diesel, base oils (SN150/SN500), and finished lubricants to oilfield, marine, power, and industrial customers across Nigeria. All deliveries come with batch certificates and quality assurance.",
    bullets: [
      "AGO/Diesel bulk delivery (5,000L – 33,000L tankers)",
      "Base Oil SN150 / SN500 (drums and bulk)",
      "Finished lubricants and greases",
      "Quality certificates on every delivery",
      "24/7 emergency supply capability",
      "Depot fulfilment and direct-to-site",
    ],
    categories: ["Base Oil/Diesel", "Chemicals"],
  },
  recruitment: {
    slug: "recruitment",
    eyebrow: "Manpower & Recruitment",
    title: "Oilfield manpower and recruitment services.",
    subtitle: "Skilled crew, engineers, and technicians — vetted and deployment-ready.",
    layman:
      "In simple terms: we find and supply the right people for your project — drillers, engineers, HSE officers, technicians — already trained, certified, and ready to work.",
    intro:
      "Specialist recruitment for the upstream, midstream, and downstream sectors. We screen, certify, and supply skilled personnel — from roustabouts and roughnecks to senior engineers and offshore captains — for short-term contracts and permanent placement.",
    bullets: [
      "Drillers, derrickmen, mud engineers, MWD/LWD",
      "HSE officers and safety supervisors",
      "Marine crew (captains, AB seamen, engineers)",
      "Procurement, logistics, and operations staff",
      "Full background and certification verification",
      "Rapid mobilisation across West Africa",
    ],
    categories: [],
  },
  logistics: {
    slug: "logistics",
    eyebrow: "Logistics Support",
    title: "Oilfield logistics and equipment movement.",
    subtitle: "Heavy haulage, vehicle supply, and last-mile delivery to remote sites.",
    layman:
      "In simple terms: we move heavy equipment, supplies, and vehicles to wherever you need them — rig sites, offshore bases, remote locations — safely and on schedule.",
    intro:
      "End-to-end logistics for oilfield operations: heavy-haul trucking, vehicle leasing (Hilux, vacuum trucks, low-loaders), warehousing, and last-mile delivery to remote and offshore locations.",
    bullets: [
      "Heavy-haul and low-loader transport",
      "Vehicle leasing and outright sales",
      "Vacuum trucks and waste hauling",
      "Bonded warehousing and storage",
      "Customs clearance and inland haulage",
      "Offshore vessel coordination",
    ],
    categories: ["Industrial Vehicles"],
  },
  safety: {
    slug: "safety",
    eyebrow: "Safety Equipment",
    title: "PPE, gas detection, and safety equipment.",
    subtitle: "Everything your crew needs to work safe — fully certified to oilfield standards.",
    layman:
      "In simple terms: we supply the protective gear that keeps your workers safe — flame-resistant coveralls, breathing apparatus, gas detectors, helmets, gloves, and boots.",
    intro:
      "Complete range of personal protective equipment and gas detection instruments certified to ANSI, EN, and NFPA standards. From single-gas monitors to full SCBA sets, FR coveralls to safety footwear — we keep your workforce protected.",
    bullets: [
      "FR/FRC Nomex coveralls and workwear",
      "H2S, O2, LEL, and multi-gas detectors",
      "SCBA sets and escape respirators",
      "Hard hats, goggles, gloves, safety boots",
      "Fall protection and rescue equipment",
      "Fire suppression and emergency kits",
    ],
    categories: ["PPE & Safety Wears"],
  },
  offshore: {
    slug: "offshore",
    eyebrow: "Offshore Support",
    title: "Offshore and marine support services.",
    subtitle: "Mooring, deck equipment, and marine consumables for offshore operations.",
    layman:
      "In simple terms: we supply the ropes, anchors, and marine gear that offshore platforms and support vessels need — keeping ships and rigs connected, safe, and operational at sea.",
    intro:
      "Marine and offshore support including mooring ropes, deck equipment, lifting gear, and consumables for FPSOs, OSVs, and offshore platforms. Crew supply and offshore manpower available on demand.",
    bullets: [
      "Marine mooring ropes (8-strand, 12-strand)",
      "Deck equipment and lifting gear",
      "Offshore vessel chandlery",
      "Captains, AB seamen, marine engineers",
      "Bunkering and offshore fuel delivery",
      "Diving and ROV support coordination",
    ],
    categories: ["Marine Equipment"],
  },
  "vendor-management": {
    slug: "vendor-management",
    eyebrow: "Vendor Management",
    title: "Vendor management and supplier consolidation.",
    subtitle: "One accountable interface for hundreds of suppliers.",
    layman:
      "In simple terms: instead of managing 100 different suppliers, you manage just us — we handle them all, vet their quality, and give you one single point of contact and one invoice.",
    intro:
      "Consolidate your supplier base under a single managed-service relationship. OJEX onboards, qualifies, audits, and monitors vendors on your behalf — reducing administrative load and improving compliance.",
    bullets: [
      "Vendor onboarding and pre-qualification",
      "HSE and compliance auditing",
      "Performance monitoring and KPI reporting",
      "Consolidated invoicing and reconciliation",
      "Local content compliance (NCDMB)",
      "Risk and continuity management",
    ],
    categories: [],
  },
};
