
-- quote_requests
DROP POLICY IF EXISTS "Anyone can submit quote requests" ON public.quote_requests;
CREATE POLICY "Public submit quote requests"
ON public.quote_requests FOR INSERT TO public
WITH CHECK (
  length(company_name) BETWEEN 1 AND 200
  AND length(contact_name) BETWEEN 1 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(product_service) BETWEEN 1 AND 500
);

-- contact_messages
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;
CREATE POLICY "Public submit contact messages"
ON public.contact_messages FOR INSERT TO public
WITH CHECK (
  length(name) BETWEEN 1 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(message) BETWEEN 3 AND 5000
);

-- vendor_registrations
DROP POLICY IF EXISTS "Anyone can register as vendor" ON public.vendor_registrations;
CREATE POLICY "Public submit vendor registrations"
ON public.vendor_registrations FOR INSERT TO public
WITH CHECK (
  length(company_name) BETWEEN 1 AND 200
  AND length(contact_name) BETWEEN 1 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(category) BETWEEN 1 AND 200
);

-- job_applications
DROP POLICY IF EXISTS "Anyone can submit job applications" ON public.job_applications;
CREATE POLICY "Public submit job applications"
ON public.job_applications FOR INSERT TO public
WITH CHECK (
  length(full_name) BETWEEN 1 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(position_applied) BETWEEN 1 AND 200
);

-- newsletter_subscribers
DROP POLICY IF EXISTS "Anyone can subscribe" ON public.newsletter_subscribers;
CREATE POLICY "Public newsletter subscribe"
ON public.newsletter_subscribers FOR INSERT TO public
WITH CHECK (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$');
