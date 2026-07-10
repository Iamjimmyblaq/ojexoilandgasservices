import lpgSkidImage from "@/assets/lpg-skid.jpg";
import procurementImage from "@/assets/procurement.jpg";
import equipmentImage from "@/assets/equipment.jpg";
import dieselImage from "@/assets/diesel-supply.jpg";
import recruitmentImage from "@/assets/recruitment.jpg";
import logisticsImage from "@/assets/logistics.jpg";
import safetyImage from "@/assets/safety.jpg";
import offshoreImage from "@/assets/hero-rig.jpg";
import vendorManagementImage from "@/assets/vendor-management.jpg";
import chemicalsImage from "@/assets/chemicals.jpg";

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
    heroImage: procurementImage,
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
    heroImage: equipmentImage,
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
    heroImage: dieselImage,
  },
  lpg: {
    slug: "lpg",
    eyebrow: "LPG Skid & Franchising",
    title: "LPG skid procurement, installation & franchising.",
    subtitle: "We help you build and operate a complete LPG retail business under the OJEX brand — from skid to steady supply.",
    layman:
      "In simple terms: we set you up with your own cooking gas station — we source the skid and accessories, install and commission it, license you to trade as an OJEX outlet, and keep supplying you the LPG. You own the business and keep the profits; we keep the products flowing.",
    intro:
      "The LPG market in Nigeria continues to present enormous opportunities for entrepreneurs, but setting up an LPG retail business can be challenging. At OJEX Oil and Gas Services Ltd, we've simplified the process. We don't just sell gas — we help you build and operate a complete LPG business, from equipment procurement through installation, commissioning, franchising under the OJEX brand, and ongoing LPG supply. It's a model similar to how major downstream brands expand their retail footprint through independently owned outlets operating within an established network.",
    bullets: [
      "Procurement of LPG gas skids and all required accessories",
      "Professional installation and commissioning to safety standards",
      "Franchise licensing to operate under the OJEX brand",
      "Operational support, staff training, and HSE guidance",
      "You own the outlet and enjoy the profits",
      "Long-term LPG supply partnership — consistent product availability",
    ],
    categories: ["LPG Skids & Accessories"],
    heroImage: lpgSkidImage,
    steps: [
      { title: "1. LPG Gas Skid Procurement", body: "We source the skid, dispensers, valves, hoses, and all accessories from vetted manufacturers — right-sized for your location and budget." },
      { title: "2. Installation & Commissioning", body: "Our engineers handle site preparation, mechanical installation, safety testing, and regulatory commissioning end to end." },
      { title: "3. Franchising Under OJEX", body: "You operate the outlet under the OJEX brand and licensing framework — carrying our name, standards, and reputation." },
      { title: "4. LPG Supply to Retailers", body: "OJEX remains your trusted supplier of LPG, ensuring consistent product availability and a long-term partnership as you grow." },
    ],
  },
  recruitment: {
    slug: "recruitment",
    eyebrow: "Manpower & HR Management",
    title: "Manpower recruitment, deployment & HR management.",
    subtitle: "We recruit, deploy, and fully manage talents and contract staff on behalf of energy companies.",
    layman:
      "In simple terms: after a company (like Sterling Oil Exploration & Energy Production Corporation) interviews and selects staff, they hand them over to us. We become the official employer — we issue the contract letters, run the onboarding, pay salaries, handle every HR letter, and manage the staff throughout the contract. The company gets the workforce; we carry the HR load.",
    intro:
      "OJEX provides end-to-end manpower and HR management services for oil & gas operators, EPCs, and industrial companies. We recruit and deploy skilled talents across every discipline, and we also take over the management of contract staff on behalf of client companies — issuing employment/contract letters, onboarding, payroll, statutory remittances, performance management, and off-boarding — so our clients focus on operations while we handle the people.",
    bullets: [
      "Talent sourcing, screening & deployment across all disciplines",
      "Full contract-staff management on behalf of client companies",
      "Employment & contract letter issuance and all HR correspondence",
      "Onboarding of employees after the client completes interviews",
      "Monthly payroll processing and salary payment to workers",
      "Statutory compliance: PAYE, pension, NSITF, ITF, HMO",
      "Performance management, discipline & off-boarding support",
      "Rapid mobilisation across Nigeria and West Africa",
    ],
    categories: [],
    heroImage: recruitmentImage,
    steps: [
      { title: "1. Client selects the staff", body: "The client company (e.g. Sterling Oil E&P) conducts interviews and selects the candidates they want on the job." },
      { title: "2. OJEX onboards & contracts", body: "We take over from there — issue the contract/employment letter, complete onboarding, HMO enrolment, and statutory registration." },
      { title: "3. We pay & manage the staff", body: "OJEX pays the workers monthly, sends all HR letters, manages leave, discipline, and performance throughout the contract." },
      { title: "4. Ongoing HR partnership", body: "The client focuses on operations; we handle every people-related task, reporting, and compliance for the duration of the engagement." },
    ],
  },
  chemicals: {
    slug: "chemicals",
    eyebrow: "Chemicals Supply",
    title: "Drilling, completion & production chemicals supply.",
    subtitle: "Full-range oilfield chemicals — sourced, certified, and delivered on spec.",
    layman:
      "In simple terms: we supply the chemicals used at every stage of an oil well — from drilling the hole, to completing it, to keeping production flowing. Barite, bentonite, calcium bromide, corrosion inhibitors, and more — all delivered on spec, on time.",
    intro:
      "OJEX supplies the full spectrum of oilfield chemicals for drilling, completion, and production operations. Every batch ships with certificates of analysis and meets API/operator specifications, backed by a global supplier network for consistent availability and pricing.",
    bullets: [
      "Drilling chemicals: Barite, CaCO₃, Bentonite, Mica, Fibroseal, LCM range",
      "Completion chemicals: Calcium Bromide, Calcium Chloride, Sodium Chloride, Oxygen Scavenger, HEC Liquid",
      "Production chemicals: corrosion inhibitors, scale inhibitors, demulsifiers, biocides, H₂S scavengers",
      "Certificates of analysis on every batch",
      "Bulk, big-bag, drum, and IBC packaging options",
      "Rig-site and depot delivery across Nigeria",
    ],
    categories: ["Chemicals", "Oilfield Consumables"],
    heroImage: chemicalsImage,
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
    heroImage: logisticsImage,
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
    heroImage: safetyImage,
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
    heroImage: offshoreImage,
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
    heroImage: vendorManagementImage,
  },
};
