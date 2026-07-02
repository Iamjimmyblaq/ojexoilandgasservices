
-- Create a private schema not exposed by PostgREST
CREATE SCHEMA IF NOT EXISTS private;

-- Move can_upload_resume out of public into private
CREATE OR REPLACE FUNCTION private.can_upload_resume(_reference text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.job_applications ja
    WHERE ja.reference = _reference
      AND ja.resume_url IS NULL
      AND ja.created_at > (now() - interval '15 minutes')
  );
$$;

-- Lock down execute: only roles that need it
REVOKE ALL ON FUNCTION private.can_upload_resume(text) FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.can_upload_resume(text) TO anon, authenticated, service_role;

-- Update the storage RLS policies that referenced public.can_upload_resume
DO $$
DECLARE
  pol record;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename = 'objects'
      AND (qual ILIKE '%can_upload_resume%' OR with_check ILIKE '%can_upload_resume%')
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', pol.policyname);
  END LOOP;
END$$;

-- Recreate the anon insert policy for resumes using the private helper
CREATE POLICY "Anon can upload resume for valid application"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND private.can_upload_resume(split_part(name, '/', 1))
);

-- Drop the now-unused public function
DROP FUNCTION IF EXISTS public.can_upload_resume(text);

-- Tighten other SECURITY DEFINER functions in public: revoke from PUBLIC/anon
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
