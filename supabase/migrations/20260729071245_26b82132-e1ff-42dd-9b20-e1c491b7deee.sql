CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM anon, authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

CREATE OR REPLACE FUNCTION private.is_staff(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role IN ('admin','editor')) $$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION private.is_staff(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_staff(uuid) TO authenticated, service_role;

-- user_roles
DROP POLICY "Users can read their own roles" ON public.user_roles;
CREATE POLICY "Users can read their own roles" ON public.user_roles FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

-- profiles
DROP POLICY "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid() OR private.has_role(auth.uid(), 'admin'));

-- events
DROP POLICY "Staff can read all events" ON public.events;
CREATE POLICY "Staff can read all events" ON public.events FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
DROP POLICY "Staff can insert events" ON public.events;
CREATE POLICY "Staff can insert events" ON public.events FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));
DROP POLICY "Staff can update events" ON public.events;
CREATE POLICY "Staff can update events" ON public.events FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
DROP POLICY "Admins can delete events" ON public.events;
CREATE POLICY "Admins can delete events" ON public.events FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- site_settings
DROP POLICY "Admins can insert site settings" ON public.site_settings;
CREATE POLICY "Admins can insert site settings" ON public.site_settings FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
DROP POLICY "Admins can update site settings" ON public.site_settings;
CREATE POLICY "Admins can update site settings" ON public.site_settings FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin')) WITH CHECK (private.has_role(auth.uid(), 'admin'));

-- submissions
DROP POLICY "Staff can read submissions" ON public.submissions;
CREATE POLICY "Staff can read submissions" ON public.submissions FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
DROP POLICY "Staff can update submissions" ON public.submissions;
CREATE POLICY "Staff can update submissions" ON public.submissions FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
DROP POLICY "Admins can delete submissions" ON public.submissions;
CREATE POLICY "Admins can delete submissions" ON public.submissions FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- sponsor_enquiries
DROP POLICY "Staff can read sponsor enquiries" ON public.sponsor_enquiries;
CREATE POLICY "Staff can read sponsor enquiries" ON public.sponsor_enquiries FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
DROP POLICY "Staff can update sponsor enquiries" ON public.sponsor_enquiries;
CREATE POLICY "Staff can update sponsor enquiries" ON public.sponsor_enquiries FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
DROP POLICY "Admins can delete sponsor enquiries" ON public.sponsor_enquiries;
CREATE POLICY "Admins can delete sponsor enquiries" ON public.sponsor_enquiries FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- subscribers
DROP POLICY "Staff can read subscribers" ON public.subscribers;
CREATE POLICY "Staff can read subscribers" ON public.subscribers FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
DROP POLICY "Staff can update subscribers" ON public.subscribers;
CREATE POLICY "Staff can update subscribers" ON public.subscribers FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
DROP POLICY "Admins can delete subscribers" ON public.subscribers;
CREATE POLICY "Admins can delete subscribers" ON public.subscribers FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- jobs
DROP POLICY "Staff can read all jobs" ON public.jobs;
CREATE POLICY "Staff can read all jobs" ON public.jobs FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
DROP POLICY "Staff can insert jobs" ON public.jobs;
CREATE POLICY "Staff can insert jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));
DROP POLICY "Staff can update jobs" ON public.jobs;
CREATE POLICY "Staff can update jobs" ON public.jobs FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
DROP POLICY "Admins can delete jobs" ON public.jobs;
CREATE POLICY "Admins can delete jobs" ON public.jobs FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- deals
DROP POLICY "Staff can read all deals" ON public.deals;
CREATE POLICY "Staff can read all deals" ON public.deals FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
DROP POLICY "Staff can insert deals" ON public.deals;
CREATE POLICY "Staff can insert deals" ON public.deals FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));
DROP POLICY "Staff can update deals" ON public.deals;
CREATE POLICY "Staff can update deals" ON public.deals FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
DROP POLICY "Admins can delete deals" ON public.deals;
CREATE POLICY "Admins can delete deals" ON public.deals FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- audit_log
DROP POLICY "Staff can read audit log" ON public.audit_log;
CREATE POLICY "Staff can read audit log" ON public.audit_log FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));

-- issues
DROP POLICY "Staff can read all issues" ON public.issues;
CREATE POLICY "Staff can read all issues" ON public.issues FOR SELECT TO authenticated USING (private.is_staff(auth.uid()));
DROP POLICY "Staff can insert issues" ON public.issues;
CREATE POLICY "Staff can insert issues" ON public.issues FOR INSERT TO authenticated WITH CHECK (private.is_staff(auth.uid()));
DROP POLICY "Staff can update issues" ON public.issues;
CREATE POLICY "Staff can update issues" ON public.issues FOR UPDATE TO authenticated USING (private.is_staff(auth.uid())) WITH CHECK (private.is_staff(auth.uid()));
DROP POLICY "Admins can delete issues" ON public.issues;
CREATE POLICY "Admins can delete issues" ON public.issues FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- storage brand bucket policies
DROP POLICY IF EXISTS "Staff can read brand files" ON storage.objects;
CREATE POLICY "Staff can read brand files" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'brand' AND private.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff can upload brand files" ON storage.objects;
CREATE POLICY "Staff can upload brand files" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'brand' AND private.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff can update brand files" ON storage.objects;
CREATE POLICY "Staff can update brand files" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'brand' AND private.is_staff(auth.uid())) WITH CHECK (bucket_id = 'brand' AND private.is_staff(auth.uid()));
DROP POLICY IF EXISTS "Staff can delete brand files" ON storage.objects;
CREATE POLICY "Staff can delete brand files" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'brand' AND private.is_staff(auth.uid()));

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);
DROP FUNCTION IF EXISTS public.is_staff(uuid);