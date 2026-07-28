-- ============ ROLES ============
CREATE TYPE public.app_role AS ENUM ('admin', 'editor');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','editor')
  )
$$;

CREATE POLICY "Users can read their own roles"
  ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email,'@',1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ EVENTS ============
CREATE TABLE public.events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  starts_on date NOT NULL,
  location text NOT NULL,
  format text NOT NULL DEFAULT 'Conference',
  price text NOT NULL DEFAULT 'Free',
  description text NOT NULL,
  image_key text NOT NULL DEFAULT 'conference',
  image_url text,
  event_url text,
  featured boolean NOT NULL DEFAULT false,
  published boolean NOT NULL DEFAULT true,
  publish_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published events are publicly readable"
  ON public.events FOR SELECT TO anon, authenticated
  USING (published = true);
CREATE POLICY "Staff can read all events"
  ON public.events FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert events"
  ON public.events FOR INSERT TO authenticated
  WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update events"
  ON public.events FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins can delete events"
  ON public.events FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.events (slug, name, starts_on, location, format, price, description, image_key, event_url) VALUES
('affiliate-summit-west','Affiliate Summit West','2027-03-15','Las Vegas, USA','Conference','From $499','The largest gathering of affiliates, networks and advertisers, with three days of partnership deal-making.','conference','https://www.affiliatesummit.com/'),
('performance-marketing-meetup','Performance Marketing Meetup','2027-03-20','London, UK','Meetup','Free','An evening of drinks and candid conversation with UK affiliate managers and publishers.','meetup',NULL),
('media-buyers-workshop','Media Buyers Workshop','2027-03-28','Online','Webinar','Free','A hands-on session on scaling paid traffic to affiliate offers without burning creative.','webinar',NULL),
('partnership-growth-summit','Partnership Growth Summit','2027-04-11','Berlin, Germany','Summit','From €350','Strategy-led talks on building partner programmes that survive tighter attribution rules.','summit',NULL),
('affiliate-world-europe','Affiliate World Europe','2027-05-03','Barcelona, Spain','Conference','From €690','Global networks, e-commerce brands and super-affiliates under one roof for two intense days.','conference','https://www.affiliateworldconferences.com/'),
('creator-affiliate-mixer','Creator x Affiliate Mixer','2027-05-19','New York, USA','Meetup','$25','Where creator-led commerce meets classic affiliate: an informal mixer for both sides of the deal.','meetup',NULL),
('seo-affiliate-clinic','SEO for Affiliates Clinic','2027-06-02','Online','Webinar','Free','A live teardown of affiliate sites, covering what still ranks after the latest core updates.','webinar',NULL),
('apac-partner-summit','APAC Partner Summit','2027-06-24','Singapore','Summit','From $420','Regional networks and advertisers on what is actually converting across Southeast Asia.','summit',NULL);

-- ============ SITE SETTINGS ============
CREATE TABLE public.site_settings (
  id boolean PRIMARY KEY DEFAULT true,
  site_name text NOT NULL DEFAULT 'The Affiliate Week',
  tagline text NOT NULL DEFAULT 'Weekly insights. Industry intelligence.',
  logo_url text,
  logo_dark_url text,
  favicon_url text,
  contact_email text NOT NULL DEFAULT 'hello@theaffiliateweek.com',
  social_links jsonb NOT NULL DEFAULT '{}'::jsonb,
  privacy_content text NOT NULL DEFAULT '',
  privacy_updated_at date,
  terms_content text NOT NULL DEFAULT '',
  terms_updated_at date,
  newsletter_provider text NOT NULL DEFAULT 'none',
  newsletter_list_id text,
  double_opt_in boolean NOT NULL DEFAULT false,
  welcome_email boolean NOT NULL DEFAULT false,
  submit_url text NOT NULL DEFAULT '',
  seo_title_template text NOT NULL DEFAULT '%s | The Affiliate Week',
  seo_description text NOT NULL DEFAULT '',
  seo_share_image_url text,
  analytics_id text,
  search_console_tag text,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT site_settings_singleton CHECK (id = true)
);

GRANT SELECT ON public.site_settings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.site_settings TO authenticated;
GRANT ALL ON public.site_settings TO service_role;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Site settings are publicly readable"
  ON public.site_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert site settings"
  ON public.site_settings FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update site settings"
  ON public.site_settings FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.site_settings (id) VALUES (true);

-- ============ SUBMISSIONS / SPONSORS WORKFLOW ============
ALTER TABLE public.submissions
  ADD COLUMN status text NOT NULL DEFAULT 'new',
  ADD COLUMN admin_notes text;
ALTER TABLE public.sponsor_enquiries
  ADD COLUMN status text NOT NULL DEFAULT 'new',
  ADD COLUMN admin_notes text;

CREATE POLICY "Staff can read submissions"
  ON public.submissions FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update submissions"
  ON public.submissions FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins can delete submissions"
  ON public.submissions FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can read sponsor enquiries"
  ON public.sponsor_enquiries FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update sponsor enquiries"
  ON public.sponsor_enquiries FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins can delete sponsor enquiries"
  ON public.sponsor_enquiries FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can read subscribers"
  ON public.subscribers FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
CREATE POLICY "Admins can delete subscribers"
  ON public.subscribers FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

GRANT SELECT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.sponsor_enquiries TO authenticated;
GRANT SELECT, DELETE ON public.subscribers TO authenticated;

-- ============ JOBS / DEALS ADMIN ACCESS + SCHEDULING ============
ALTER TABLE public.jobs ADD COLUMN publish_at timestamptz;
ALTER TABLE public.deals ADD COLUMN publish_at timestamptz;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.deals TO authenticated;

CREATE POLICY "Staff can read all jobs"
  ON public.jobs FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert jobs"
  ON public.jobs FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update jobs"
  ON public.jobs FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins can delete jobs"
  ON public.jobs FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Staff can read all deals"
  ON public.deals FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "Staff can insert deals"
  ON public.deals FOR INSERT TO authenticated WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Staff can update deals"
  ON public.deals FOR UPDATE TO authenticated
  USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "Admins can delete deals"
  ON public.deals FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- ============ AUDIT LOG ============
CREATE TABLE public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid,
  actor_email text,
  action text NOT NULL,
  entity text NOT NULL,
  entity_id text,
  detail jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.audit_log TO authenticated;
GRANT ALL ON public.audit_log TO service_role;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read audit log"
  ON public.audit_log FOR SELECT TO authenticated
  USING (public.is_staff(auth.uid()));
