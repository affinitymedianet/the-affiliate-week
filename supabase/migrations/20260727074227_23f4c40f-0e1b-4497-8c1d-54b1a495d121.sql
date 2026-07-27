CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL,
  title text NOT NULL,
  organisation text,
  url text,
  location text,
  happens_on text,
  details text,
  submitter_name text NOT NULL,
  submitter_email text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.submissions TO anon, authenticated;
GRANT ALL ON public.submissions TO service_role;

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit content"
ON public.submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  kind = ANY (ARRAY['event','job','offer'])
  AND length(title) BETWEEN 1 AND 200
  AND coalesce(length(organisation), 0) <= 200
  AND coalesce(length(url), 0) <= 500
  AND coalesce(length(location), 0) <= 200
  AND coalesce(length(happens_on), 0) <= 100
  AND coalesce(length(details), 0) <= 2000
  AND length(submitter_name) BETWEEN 1 AND 120
  AND submitter_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(submitter_email) <= 255
);

CREATE TABLE public.sponsor_enquiries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  company text NOT NULL,
  email text NOT NULL,
  website text,
  budget text,
  message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT INSERT ON public.sponsor_enquiries TO anon, authenticated;
GRANT ALL ON public.sponsor_enquiries TO service_role;

ALTER TABLE public.sponsor_enquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can enquire about sponsorship"
ON public.sponsor_enquiries
FOR INSERT
TO anon, authenticated
WITH CHECK (
  length(name) BETWEEN 1 AND 120
  AND length(company) BETWEEN 1 AND 200
  AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'
  AND length(email) <= 255
  AND coalesce(length(website), 0) <= 500
  AND coalesce(length(budget), 0) <= 100
  AND coalesce(length(message), 0) <= 2000
);