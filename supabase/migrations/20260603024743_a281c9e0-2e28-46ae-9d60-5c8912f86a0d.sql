CREATE POLICY "Users view own applications by email"
ON public.job_applications
FOR SELECT
TO authenticated
USING (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));