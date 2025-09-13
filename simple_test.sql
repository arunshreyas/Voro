-- SIMPLE TEST - Run this to check what's working
-- This will help us identify the exact issue

-- Test 1: Check if you're logged in
SELECT 
  'User Status' as test,
  CASE 
    WHEN auth.uid() IS NOT NULL THEN 'LOGGED IN - User ID: ' || auth.uid()
    ELSE 'NOT LOGGED IN'
  END as result;

-- Test 2: Check if avatars bucket exists
SELECT 
  'Storage Bucket' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'avatars') 
    THEN 'EXISTS'
    ELSE 'MISSING - Need to create it'
  END as result;

-- Test 3: Check if you have a profile
SELECT 
  'Profile Status' as test,
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) 
    THEN 'EXISTS'
    ELSE 'MISSING - Need to create it'
  END as result;
