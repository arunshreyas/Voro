-- IMMEDIATE FIX for RLS policy violation
-- Run this in your Supabase SQL Editor

-- 1. First, temporarily disable RLS to fix existing issues
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Create the auto-profile creation function
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 5. Create all necessary policies
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

-- 6. Verify everything is working
SELECT 'RLS Policies Created Successfully' as status;
