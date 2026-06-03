DROP POLICY IF EXISTS "Public submit resumes with valid path" ON storage.objects;

CREATE POLICY "Public submit resumes with valid path"
ON storage.objects
FOR INSERT
TO anon, authenticated
WITH CHECK (
  bucket_id = 'resumes'
  AND name ~ '^JOB-[0-9]{6}-[A-Z0-9]{6}/[0-9]+_[A-Za-z0-9._-]{1,120}\.(pdf|doc|docx|PDF|DOC|DOCX)$'
  AND EXISTS (
    SELECT 1 FROM public.job_applications ja
    WHERE ja.reference = (storage.foldername(storage.objects.name))[1]
      AND ja.resume_url IS NULL
      AND ja.created_at > now() - interval '15 minutes'
  )
);