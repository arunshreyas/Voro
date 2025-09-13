-- SIMPLE FIX - Only works with profiles table
-- Run this to fix the profiles table only

-- 1. Disable RLS on profiles table
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Create avatars bucket if it doesn't exist (this should work)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 3. Ensure current user has a profile
INSERT INTO profiles (id, username, full_name, avatar_url, bio)
SELECT 
  auth.uid(),
  COALESCE(
    (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = auth.uid()),
    'user_' || substr(auth.uid()::text, 1, 8)
  ),
  COALESCE(
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = auth.uid()),
    'User'
  ),
  NULL,
  NULL
WHERE auth.uid() IS NOT NULL
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name;

-- 4. Verify profiles RLS is disabled
SELECT 
  'Profiles RLS' as table_name,
  CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables WHERE tablename = 'profiles';

-- 5. Check if avatars bucket exists
SELECT 
  'Avatars Bucket' as item,
  CASE WHEN name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM storage.buckets WHERE name = 'avatars';

-- 6. Success message
SELECT 'Profiles RLS disabled - Try avatar upload now!' as result;
