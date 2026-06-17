DROP POLICY IF EXISTS "channel_types_public_read" ON public.channel_types;
CREATE POLICY "channel_types_public_read"
  ON public.channel_types
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "idea_groups_public_read" ON public.idea_groups;
CREATE POLICY "idea_groups_public_read"
  ON public.idea_groups
  FOR SELECT
  TO authenticated
  USING (true);