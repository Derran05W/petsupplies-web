-- Migrate ADMIN role from user_metadata to app_metadata (server-controlled).
-- Run once in Supabase SQL Editor. Users cannot self-edit app_metadata via updateUser.
--
-- After running, update Storage RLS policies to check app_metadata.role (see lib/supabase/storage.ts).

UPDATE auth.users
SET raw_app_meta_data =
  COALESCE(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('role', raw_user_meta_data->>'role')
WHERE raw_user_meta_data->>'role' = 'ADMIN'
  AND COALESCE(raw_app_meta_data->>'role', '') <> 'ADMIN';
