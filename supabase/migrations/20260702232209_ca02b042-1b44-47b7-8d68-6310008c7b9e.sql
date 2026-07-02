
-- SECURITY DEFINER helper so storage RLS can validate the application without needing anon SELECT on job_applications
CREATE OR REPLACE FUNCTION public.can_upload_resume(_reference text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.job_applications ja
    WHERE ja.reference = _reference
      AND ja.resume_url IS NULL
      AND ja.created_at > (now() - interval '15 minutes')
  );
$$;

REVOKE ALL ON FUNCTION public.can_upload_resume(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.can_upload_resume(text) TO anon, authenticated;

DROP POLICY IF EXISTS "Public submit resumes with valid path" ON storage.objects;

CREATE POLICY "Public submit resumes with valid path"
ON storage.objects FOR INSERT TO anon, authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND name ~ '^JOB-[0-9]{6}-[A-Z0-9]{6}/[0-9]+_[A-Za-z0-9._-]{1,120}\.(pdf|doc|docx|PDF|DOC|DOCX)$'
  AND public.can_upload_resume((storage.foldername(storage.objects.name))[1])
);
