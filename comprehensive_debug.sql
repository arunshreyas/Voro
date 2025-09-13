-- COMPREHENSIVE DEBUG SCRIPT
-- Run this to identify the exact issue

-- 1. Check RLS status
SELECT 
  'RLS Status' as check_type,
  CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as status
FROM pg_tables 
WHERE tablename = 'profiles'

UNION ALL

-- 2. Check if avatars bucket exists
SELECT 
  'Storage Bucket' as check_type,
  CASE WHEN name IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM storage.buckets 
WHERE name = 'avatars'

UNION ALL

-- 3. Check storage policies
SELECT 
  'Storage Policies' as check_type,
  CASE WHEN COUNT(*) > 0 THEN 'EXIST (' || COUNT(*) || ')' ELSE 'NONE' END as status
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage'

UNION ALL

-- 4. Check profiles table policies
SELECT 
  'Profile Policies' as check_type,
  CASE WHEN COUNT(*) > 0 THEN 'EXIST (' || COUNT(*) || ')' ELSE 'NONE' END as status
FROM pg_policies 
WHERE tablename = 'profiles'

UNION ALL

-- 5. Check if current user has profile
SELECT 
  'User Profile' as check_type,
  CASE WHEN id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as status
FROM profiles 
WHERE id = auth.uid()

UNION ALL

-- 6. Check current user
SELECT 
  'Current User' as check_type,
  CASE WHEN auth.uid() IS NOT NULL THEN 'LOGGED IN' ELSE 'NOT LOGGED IN' END as status;
