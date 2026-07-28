CREATE TABLE public.issues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  number integer NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  reading_time text NOT NULL DEFAULT '5 min read',
  cover_url text,
  sections jsonb NOT NULL DEFAULT '[]'::jsonb,
  issue_date date NOT NULL DEFAULT CURRENT_DATE,
  published boolean NOT NULL DEFAULT true,
  publish_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

GRANT SELECT ON public.issues TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.issues TO authenticated;
GRANT ALL ON public.issues TO service_role;

ALTER TABLE public.issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published issues are publicly readable"
  ON public.issues FOR SELECT TO anon, authenticated
  USING (published = true AND (publish_at IS NULL OR publish_at <= now()));

CREATE POLICY "Staff can read all issues"
  ON public.issues FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));

CREATE POLICY "Staff can insert issues"
  ON public.issues FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Staff can update issues"
  ON public.issues FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

CREATE POLICY "Admins can delete issues"
  ON public.issues FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_issues_updated_at
  BEFORE UPDATE ON public.issues
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.subscribers
  ADD COLUMN status text NOT NULL DEFAULT 'active',
  ADD COLUMN unsubscribed_at timestamp with time zone,
  ADD COLUMN unsubscribe_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE POLICY "Staff can update subscribers"
  ON public.subscribers FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));