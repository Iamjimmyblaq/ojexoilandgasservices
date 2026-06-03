DROP POLICY IF EXISTS "Public can upload resumes" ON storage.objects;

CREATE POLICY "Public submit resumes with valid path"
ON storage.objects
FOR INSERT
TO public
WITH CHECK (
  bucket_id = 'resumes'
  AND name ~ '^JOB-[0-9]{6}-[A-Z0-9]{6}/[0-9]+_[A-Za-z0-9._-]{1,120}\.(pdf|doc|docx|PDF|DOC|DOCX)$'
);

CREATE POLICY "Public read product images"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Admins read blog images"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins write blog images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update blog images bucket"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete blog images bucket"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'blog-images' AND has_role(auth.uid(), 'admin'::app_role));