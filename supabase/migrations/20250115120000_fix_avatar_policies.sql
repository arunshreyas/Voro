/*
  # Fix RLS policies for profiles table and avatar updates
  
  This migration fixes the RLS policy violations by:
  1. Creating profiles for existing users
  2. Setting up auto-profile creation trigger
  3. Adding comprehensive RLS policies
  4. Ensuring avatar updates work properly
*/

-- Step 1: Create profiles for existing users who don't have them
INSERT INTO profiles (id, username, full_name, avatar_url, bio)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
  COALESCE(au.raw_user_meta_data->>'full_name', '') as full_name,
  NULL as avatar_url,
  NULL as bio
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Step 2: Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  username_value TEXT;
  full_name_value TEXT;
BEGIN
  -- Extract username and full_name from user metadata
  username_value := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1));
  full_name_value := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
  
  -- Insert new profile
  INSERT INTO public.profiles (id, username, full_name, avatar_url, bio)
  VALUES (
    NEW.id,
    username_value,
    full_name_value,
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    NULL
  );
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own avatar" ON profiles;

-- Step 6: Create comprehensive policies
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Step 7: Create indexes for performance
CREATE INDEX IF NOT EXISTS profiles_avatar_url_idx ON profiles(avatar_url) WHERE avatar_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username) WHERE username IS NOT NULL;

-- Step 8: Add comments
COMMENT ON FUNCTION public.handle_new_user() IS 
'Automatically creates a profile when a new user signs up';
COMMENT ON POLICY "Users can update their own profile" ON profiles IS 
'Allows authenticated users to update their own profile including avatar_url';
