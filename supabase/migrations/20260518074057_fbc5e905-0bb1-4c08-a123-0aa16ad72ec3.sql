
-- 1. Explicit deny on user_roles INSERT/UPDATE/DELETE except admins (defence-in-depth)
DROP POLICY IF EXISTS "Admins insert roles" ON public.user_roles;
CREATE POLICY "Admins insert roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins update roles" ON public.user_roles;
CREATE POLICY "Admins update roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP POLICY IF EXISTS "Admins delete roles" ON public.user_roles;
CREATE POLICY "Admins delete roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2. Remove duplicate permissive INSERT policy on storage.objects for procurement-docs
DROP POLICY IF EXISTS "Authenticated upload procurement docs" ON storage.objects;

-- 3. Public bucket listing: restrict storage.objects SELECT on product-images so
-- arbitrary listing is not possible; direct file access via the public URL still works.
DROP POLICY IF EXISTS "Public read product images" ON storage.objects;
CREATE POLICY "Admins list product images" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'product-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- 4. Lock down SECURITY DEFINER functions: revoke EXECUTE from anon/public.
-- has_role must remain callable by authenticated for RLS evaluation.
REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated;

REVOKE ALL ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
