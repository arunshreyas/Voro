-- ENSURE USER HAS PROFILE
-- Run this to create a profile for the current user if they don't have one

-- Create profile for current user if it doesn't exist
INSERT INTO profiles (id, username, full_name, avatar_url, bio)
SELECT 
  auth.uid(),
  COALESCE(
    (SELECT raw_user_meta_data->>'username' FROM auth.users WHERE id = auth.uid()),
    split_part((SELECT email FROM auth.users WHERE id = auth.uid()), '@', 1)
  ),
  COALESCE(
    (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = auth.uid()),
    ''
  ),
  NULL,
  NULL
WHERE auth.uid() IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- Check if profile was created/updated
SELECT 
  'Profile Status' as status,
  CASE 
    WHEN id IS NOT NULL THEN 'Profile exists for user: ' || id
    ELSE 'No profile found'
  END as result
FROM profiles 
WHERE id = auth.uid();
