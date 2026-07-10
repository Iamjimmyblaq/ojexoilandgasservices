export const SITE = {
  name: "OJEX Oil and Gas Services",
  short: "OJEX",
  tagline: "Industrial Sourcing, Procurement & Energy-Sector Manpower",
  description:
    "OJEX Oil and Gas Services delivers industrial procurement, drilling equipment supply, base oil & diesel distribution, logistics, and oilfield manpower recruitment across West Africa and beyond.",
  email: "ojexoilandgasservices@gmail.com",
  phone: "+234 707 572 8373",
  phoneHref: "tel:+2347075728373",
  whatsapp: "https://wa.me/2347075728373",
  whatsappNumber: "+234 707 572 8373",
  address: "No. 183 Okporo Road, Rumuodara, Artillery Road, Port Harcourt, Rivers State, Nigeria",
  addressShort: "Port Harcourt, Rivers State, Nigeria",
} as const;

export const NAV_PRIMARY = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/services", label: "Services" },
  { to: "/products", label: "Products" },
  { to: "/industries", label: "Industries" },
  { to: "/projects", label: "Projects" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact" },
] as const;

export const SERVICE_LINKS = [
  { to: "/services/procurement", label: "Procurement & Sourcing" },
  { to: "/services/equipment", label: "Industrial Equipment Supply" },
  { to: "/services/diesel", label: "Base Oil & Diesel Supply" },
  { to: "/services/lpg", label: "LPG Skid & Franchising" },
  { to: "/services/recruitment", label: "Manpower & HR Management" },
  { to: "/services/chemicals", label: "Chemicals Supply" },
  { to: "/services/logistics", label: "Logistics Support" },
  { to: "/services/safety", label: "Safety Equipment" },
  { to: "/services/offshore", label: "Offshore Support" },
  { to: "/services/vendor-management", label: "Vendor Management" },
] as const;

export const PRODUCT_CATEGORIES = [
  "Shale Shakers",
  "Mud Cleaners",
  "Shaker Screens",
  "Drilling Equipment",
  "Industrial Vehicles",
  "Marine Equipment",
  "PPE & Safety Wears",
  "Industrial Tools",
  "Oilfield Consumables",
  "Chemicals",
  "Base Oil/Diesel",
  "LPG Skids & Accessories",
] as const;

export const INDUSTRIES = [
  { name: "Oil & Gas Operators", desc: "Upstream, midstream, and downstream operators across West Africa." },
  { name: "Drilling Contractors", desc: "Onshore and offshore drilling contractors needing reliable equipment supply." },
  { name: "Marine & Offshore", desc: "Marine support vessels, FPSOs, and offshore platforms." },
  { name: "EPC & Construction", desc: "Engineering, procurement, and construction firms on energy projects." },
  { name: "Power & Industrial", desc: "Power plants, factories, and heavy industrial users of diesel and lubricants." },
  { name: "Mining & Heavy Equipment", desc: "Mining operators with industrial sourcing and consumables needs." },
];
