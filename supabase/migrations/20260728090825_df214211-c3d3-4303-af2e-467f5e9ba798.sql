CREATE POLICY "Staff can read brand files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'brand' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can upload brand files"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'brand' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can update brand files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'brand' AND public.is_staff(auth.uid()))
  WITH CHECK (bucket_id = 'brand' AND public.is_staff(auth.uid()));

CREATE POLICY "Staff can delete brand files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'brand' AND public.is_staff(auth.uid()));