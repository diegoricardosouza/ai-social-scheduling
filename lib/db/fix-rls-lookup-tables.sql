-- Enable RLS on channel_types (lookup table, read-only for all users)
ALTER TABLE public.channel_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channel_types FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "channel_types_public_read" ON public.channel_types;
CREATE POLICY "channel_types_public_read"
  ON public.channel_types
  FOR SELECT
  USING (true);

-- Enable RLS on idea_groups (lookup table, read-only for all users)
ALTER TABLE public.idea_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.idea_groups FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "idea_groups_public_read" ON public.idea_groups;
CREATE POLICY "idea_groups_public_read"
  ON public.idea_groups
  FOR SELECT
  USING (true);