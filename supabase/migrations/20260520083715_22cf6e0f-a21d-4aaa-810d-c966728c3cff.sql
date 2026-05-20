
-- 1. Quote reference number
ALTER TABLE public.quote_requests
  ADD COLUMN IF NOT EXISTS reference text NOT NULL
  DEFAULT ('OJX-' || to_char(now(), 'YYMMDD') || '-' || upper(substr(gen_random_uuid()::text, 1, 6)));

CREATE UNIQUE INDEX IF NOT EXISTS quote_requests_reference_idx ON public.quote_requests(reference);

-- 2. Email log
CREATE TABLE IF NOT EXISTS public.email_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  recipient text NOT NULL,
  subject text NOT NULL,
  status text NOT NULL,
  error text,
  related_id uuid,
  related_reference text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins view email log" ON public.email_log;
CREATE POLICY "Admins view email log" ON public.email_log
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX IF NOT EXISTS email_log_created_idx ON public.email_log(created_at DESC);
CREATE INDEX IF NOT EXISTS email_log_kind_idx ON public.email_log(kind);
