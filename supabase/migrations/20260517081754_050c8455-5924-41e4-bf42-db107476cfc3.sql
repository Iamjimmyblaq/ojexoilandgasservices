
-- 1) Demote any non-official admin accounts
DELETE FROM public.user_roles
WHERE role = 'admin'
  AND user_id NOT IN (
    SELECT id FROM auth.users WHERE email = 'ojexoilandgasservices@gmail.com'
  );

-- 2) Tighten procurement-docs storage SELECT policy
DROP POLICY IF EXISTS "Authenticated read procurement docs" ON storage.objects;
DROP POLICY IF EXISTS "procurement docs read access" ON storage.objects;

CREATE POLICY "Procurement docs read scoped"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'procurement-docs'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'manager'::app_role)
    OR (storage.foldername(name))[1] = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM public.procurement_documents d
      JOIN public.procurement_requests r ON r.id = d.request_id
      WHERE d.file_path = storage.objects.name
        AND (r.created_by = auth.uid() OR r.assigned_to = auth.uid() OR d.uploaded_by = auth.uid())
    )
  )
);

CREATE POLICY "Procurement docs write own folder"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'procurement-docs'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Procurement docs delete own or admin"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'procurement-docs'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);

-- 3) Revoke direct EXECUTE on the new-user trigger function (only triggers should call it)
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- 4) Public product-images bucket for admin-managed product/gallery photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read product images"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'product-images');

CREATE POLICY "Admins upload product images"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins update product images"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins delete product images"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'product-images' AND has_role(auth.uid(), 'admin'::app_role));
