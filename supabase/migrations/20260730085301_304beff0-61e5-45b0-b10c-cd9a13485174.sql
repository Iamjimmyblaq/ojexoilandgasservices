ALTER TABLE public.vendor_registrations ADD COLUMN IF NOT EXISTS reference text;
CREATE INDEX IF NOT EXISTS vendor_registrations_reference_idx ON public.vendor_registrations (reference);
DELETE FROM public.vendor_registrations WHERE company_name = 'Test Co' AND email = 'test@example.com';