
-- 1) Add reference column to job_applications (auto-generated, like quote_requests)
ALTER TABLE public.job_applications 
ADD COLUMN IF NOT EXISTS reference text NOT NULL 
DEFAULT ('JOB-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(gen_random_uuid()::text, 1, 6)));

CREATE INDEX IF NOT EXISTS idx_job_applications_reference ON public.job_applications(reference);
CREATE INDEX IF NOT EXISTS idx_job_applications_email ON public.job_applications(lower(email));

-- 2) Create private resumes storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('resumes', 'resumes', false)
ON CONFLICT (id) DO NOTHING;

-- Anonymous public can upload resumes (job applicants)
DROP POLICY IF EXISTS "Public can upload resumes" ON storage.objects;
CREATE POLICY "Public can upload resumes"
ON storage.objects FOR INSERT TO public
WITH CHECK (bucket_id = 'resumes');

-- Only admins can read/download resumes
DROP POLICY IF EXISTS "Admins read resumes" ON storage.objects;
CREATE POLICY "Admins read resumes"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins delete resumes" ON storage.objects;
CREATE POLICY "Admins delete resumes"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'resumes' AND public.has_role(auth.uid(), 'admin'));
