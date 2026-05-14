
-- PRODUCTS
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  sku text,
  category text not null,
  short_description text,
  description text,
  specifications jsonb default '{}'::jsonb,
  image_url text,
  brochure_url text,
  manufacturer text,
  in_stock boolean not null default true,
  featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.products enable row level security;
create policy "Public can view active products" on public.products for select using (active = true);

-- QUOTE REQUESTS
create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  product_service text not null,
  quantity text,
  delivery_location text,
  timeline text,
  budget text,
  notes text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
alter table public.quote_requests enable row level security;
create policy "Anyone can submit quote requests" on public.quote_requests for insert with check (true);

-- CONTACT MESSAGES
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  company text,
  subject text,
  message text not null,
  created_at timestamptz not null default now()
);
alter table public.contact_messages enable row level security;
create policy "Anyone can submit contact messages" on public.contact_messages for insert with check (true);

-- VENDOR REGISTRATIONS
create table public.vendor_registrations (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text not null,
  email text not null,
  phone text,
  country text,
  website text,
  category text not null,
  capabilities text,
  created_at timestamptz not null default now()
);
alter table public.vendor_registrations enable row level security;
create policy "Anyone can register as vendor" on public.vendor_registrations for insert with check (true);

-- JOB LISTINGS
create table public.job_listings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text not null,
  location text not null,
  job_type text not null default 'Full-time',
  description text not null,
  requirements text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.job_listings enable row level security;
create policy "Public can view active jobs" on public.job_listings for select using (active = true);

-- JOB APPLICATIONS
create table public.job_applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.job_listings(id) on delete set null,
  full_name text not null,
  email text not null,
  phone text,
  position_applied text not null,
  experience_years int,
  cover_letter text,
  resume_url text,
  status text not null default 'new',
  created_at timestamptz not null default now()
);
alter table public.job_applications enable row level security;
create policy "Anyone can submit job applications" on public.job_applications for insert with check (true);

-- NEWSLETTER
create table public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz not null default now()
);
alter table public.newsletter_subscribers enable row level security;
create policy "Anyone can subscribe" on public.newsletter_subscribers for insert with check (true);

-- Seed sample products
insert into public.products (name, slug, sku, category, short_description, description, manufacturer, featured) values
('Linear Motion Shale Shaker', 'linear-motion-shale-shaker', 'SS-LM-500', 'Shale Shakers', 'High-performance linear motion shale shaker for primary solids control.', 'Heavy-duty linear motion shale shaker engineered for demanding drilling operations. Features dual vibrators, robust steel frame, and quick screen-change system.', 'OEM Partner', true),
('Compact Mud Cleaner', 'compact-mud-cleaner', 'MC-CT-200', 'Mud Cleaners', 'Combined desander/desilter unit with integrated shaker.', 'All-in-one mud cleaning solution combining hydrocyclones with a fine-mesh shaker. Reduces drilling fluid loss and extends mud life.', 'OEM Partner', true),
('API RP 13C Shaker Screens', 'api-shaker-screens', 'SCR-API-110', 'Shaker Screens', 'Premium 3-layer composite shaker screens, API-rated.', 'Pretensioned composite shaker screens manufactured to API RP 13C specifications. Available in API 80 to API 325 mesh sizes.', 'Multi-Brand', true),
('PDC Drill Bit 12-1/4"', 'pdc-drill-bit-12-25', 'DB-PDC-1225', 'Drilling Equipment', 'Polycrystalline diamond compact bit for hard formations.', '6-blade PDC bit optimised for medium-to-hard formations. IADC code M323.', 'OEM Partner', false),
('Heavy-Duty Vacuum Truck', 'heavy-duty-vacuum-truck', 'IV-VT-8000', 'Industrial Vehicles', '8000-gallon vacuum tanker for oilfield waste handling.', 'Tandem-axle vacuum truck with stainless steel tank, hydraulic dump, and pneumatic offload. Compliant with DOT 407 standards.', 'Multi-Brand', false),
('Marine Mooring Rope', 'marine-mooring-rope', 'ME-MR-72', 'Marine Equipment', '72mm 8-strand polyester mooring rope.', 'High-tenacity polyester mooring line with spliced eyes. MBL 95 tonnes.', 'OEM Partner', false),
('FRC Coverall (Nomex IIIA)', 'frc-coverall-nomex', 'PPE-FRC-N3A', 'PPE & Safety Wears', 'Flame-resistant coverall, NFPA 2112 certified.', 'Genuine DuPont Nomex IIIA coverall with reflective tape. Sizes S-4XL.', 'DuPont', true),
('Hydraulic Torque Wrench', 'hydraulic-torque-wrench', 'IT-HTW-30', 'Industrial Tools', '3000 Nm hydraulic torque wrench kit.', 'Square-drive hydraulic torque wrench complete with pump, hoses, and reaction arm.', 'Multi-Brand', false),
('Drilling Mud Additives', 'drilling-mud-additives', 'OC-MA-25', 'Oilfield Consumables', 'Bentonite, barite, and polymer additives.', 'Full range of water-based and oil-based mud additives. Bulk and sack supply available.', 'Multi-Brand', false),
('Industrial Degreaser (200L)', 'industrial-degreaser-200l', 'CHM-DG-200', 'Chemicals', 'Heavy-duty solvent degreaser for rig wash-down.', 'Biodegradable, low-VOC degreaser supplied in 200L drums or IBC.', 'Multi-Brand', false),
('AGO / Diesel (Bulk)', 'ago-diesel-bulk', 'BO-AGO-BULK', 'Base Oil/Diesel', 'Bulk supply of automotive gas oil (AGO) for industrial sites.', 'High-quality diesel supplied in bulk by tanker, with full quality certification and on-site delivery across Nigeria and West Africa.', 'OJEX', true),
('Base Oil SN 150 / SN 500', 'base-oil-sn', 'BO-SN-500', 'Base Oil/Diesel', 'Group I & II base oils for lubricant blending.', 'Imported and locally-sourced base oils supplied in flexitank, ISO tank, or drums. Certificates of analysis included.', 'OJEX', true);

-- Seed sample jobs
insert into public.job_listings (title, category, location, job_type, description, requirements) values
('Senior Drilling Engineer', 'Engineering', 'Port Harcourt, Nigeria', 'Full-time', 'Lead drilling operations on offshore and onshore projects across West Africa.', 'B.Eng Petroleum/Mechanical, 8+ years drilling experience, IWCF certification.'),
('Offshore Crane Operator', 'Offshore', 'Offshore - Rotational', 'Contract', 'Operate offshore pedestal cranes on production platforms.', 'Valid OPITO BOSIET, 5+ years offshore crane experience, Stage 4 certification.'),
('Procurement Officer', 'Admin', 'Lagos, Nigeria', 'Full-time', 'Manage vendor sourcing and purchase orders for industrial equipment.', '5+ years oil & gas procurement, CIPS preferred, strong negotiation skills.'),
('Safety Officer (HSE)', 'Technical', 'Port Harcourt, Nigeria', 'Full-time', 'Lead HSE compliance on client projects.', 'NEBOSH IGC, 5+ years HSE experience in oil & gas.'),
('Logistics Coordinator', 'Admin', 'Port Harcourt, Nigeria', 'Full-time', 'Coordinate inbound/outbound shipments and customs clearance.', '3+ years freight forwarding experience, knowledge of NPA/Customs procedures.');
