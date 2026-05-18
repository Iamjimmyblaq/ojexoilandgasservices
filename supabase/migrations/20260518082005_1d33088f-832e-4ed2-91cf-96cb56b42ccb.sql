-- Tighten procurement_documents DELETE to admins only (drop uploader-self-delete)
DROP POLICY IF EXISTS "Admins delete docs" ON public.procurement_documents;
CREATE POLICY "Admins delete docs"
ON public.procurement_documents
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Remove duplicate DELETE storage policy on procurement-docs bucket
DROP POLICY IF EXISTS "Procurement docs delete own or admin" ON storage.objects;