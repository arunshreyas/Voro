-- DEBUG AVATAR UPLOAD ISSUES
-- Run these queries to identify the real problem

-- 1. Check if avatars storage bucket exists
SELECT name, public, file_size_limit, allowed_mime_types
FROM storage.buckets 
WHERE name = 'avatars';

-- 2. Check storage policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- 3. Check if user has a profile
SELECT id, username, full_name, avatar_url, created_at
FROM profiles 
WHERE id = auth.uid();

-- 4. Check current user
SELECT auth.uid() as current_user_id;

-- 5. Test if we can insert into profiles (should work with RLS disabled)
INSERT INTO profiles (id, username, full_name, avatar_url, bio)
VALUES (
  auth.uid(),
  'test_user_' || extract(epoch from now()),
  'Test User',
  'https://example.com/test.jpg',
  'Test bio'
)
ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  full_name = EXCLUDED.full_name,
  avatar_url = EXCLUDED.avatar_url,
  bio = EXCLUDED.bio;

-- 6. Check if the insert worked
SELECT id, username, full_name, avatar_url
FROM profiles 
WHERE id = auth.uid();
