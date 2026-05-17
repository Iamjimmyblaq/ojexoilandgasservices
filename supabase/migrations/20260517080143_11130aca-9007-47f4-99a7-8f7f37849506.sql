INSERT INTO public.user_roles (user_id, role)
SELECT 'e37a8665-d98c-465d-86c0-abfb506e47e0'::uuid, 'admin'::app_role
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles
  WHERE user_id = 'e37a8665-d98c-465d-86c0-abfb506e47e0'::uuid AND role = 'admin'::app_role
);