-- DEBUG AND FIX RLS ISSUES
-- Run this step by step in your Supabase SQL Editor

-- Step 1: Check current RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';

-- Step 2: Check existing policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Step 3: Check if trigger exists
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Step 4: Check if function exists
SELECT routine_name, routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Step 5: TEMPORARILY disable RLS to fix the issue
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 6: Create profiles for existing users who don't have them
INSERT INTO profiles (id, username, full_name, avatar_url, bio)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
  COALESCE(au.raw_user_meta_data->>'full_name', '') as full_name,
  NULL as avatar_url,
  NULL as bio
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Step 7: Create the trigger function
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

-- Step 8: Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 9: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 10: Create policies
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

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

-- Step 11: Verify everything is working
SELECT 'Setup Complete - RLS should now work' as status;
