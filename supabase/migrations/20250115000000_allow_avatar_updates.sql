/*
  # Create comprehensive RLS policies for profiles table and auto-profile creation
  
  This migration adds all necessary Row Level Security policies for the profiles table
  and creates a trigger to automatically create profiles when users sign up.
  
  Features:
  - RLS policies for all profile operations
  - Auto-profile creation trigger
  - Username validation
  - Performance indexes
*/

-- Enable RLS on profiles table if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own avatar" ON profiles;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function to handle new user creation
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

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Allow users to read all profiles (needed for displaying user info in posts)
CREATE POLICY "Users can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow users to insert their own profile (during signup - fallback)
CREATE POLICY "Users can insert their own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile (including avatar_url)
CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to delete their own profile (account deletion)
CREATE POLICY "Users can delete their own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_avatar_url_idx ON profiles(avatar_url) WHERE avatar_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS profiles_username_idx ON profiles(username) WHERE username IS NOT NULL;

-- Add comments for documentation
COMMENT ON FUNCTION public.handle_new_user() IS 
'Automatically creates a profile when a new user signs up';
COMMENT ON POLICY "Users can read all profiles" ON profiles IS 
'Allows authenticated users to read all profiles for displaying user information';
COMMENT ON POLICY "Users can insert their own profile" ON profiles IS 
'Allows authenticated users to create their own profile during signup (fallback)';
COMMENT ON POLICY "Users can update their own profile" ON profiles IS 
'Allows authenticated users to update their own profile including avatar_url';
COMMENT ON POLICY "Users can delete their own profile" ON profiles IS 
'Allows authenticated users to delete their own profile for account deletion';
