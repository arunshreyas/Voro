-- TEST RLS FIX
-- Run this after the debug_and_fix_rls.sql to verify everything works

-- Test 1: Check if RLS is enabled
SELECT 
  CASE 
    WHEN rowsecurity THEN 'RLS is ENABLED' 
    ELSE 'RLS is DISABLED' 
  END as rls_status
FROM pg_tables 
WHERE tablename = 'profiles';

-- Test 2: List all policies
SELECT 
  policyname,
  cmd as operation,
  CASE 
    WHEN permissive THEN 'PERMISSIVE' 
    ELSE 'RESTRICTIVE' 
  END as policy_type
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Test 3: Check trigger
SELECT 
  CASE 
    WHEN trigger_name IS NOT NULL THEN 'Trigger EXISTS' 
    ELSE 'Trigger MISSING' 
  END as trigger_status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Test 4: Check function
SELECT 
  CASE 
    WHEN routine_name IS NOT NULL THEN 'Function EXISTS' 
    ELSE 'Function MISSING' 
  END as function_status
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Test 5: Count profiles vs users
SELECT 
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM profiles) 
    THEN 'PROFILES MATCH USERS' 
    ELSE 'MISMATCH - Some users missing profiles' 
  END as profile_status;
