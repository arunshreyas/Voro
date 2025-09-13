/*
  # Add donations feature to posts

  1. New Tables
    - `donations`
      - `id` (uuid, primary key)
      - `post_id` (uuid, foreign key to posts)
      - `user_id` (uuid, foreign key to users)
      - `amount` (decimal)
      - `created_at` (timestamp)

  2. Schema Changes
    - Add `donation_goal` column to posts table
    - Add `total_donations` column to posts table

  3. Security
    - Enable RLS on `donations` table
    - Add policies for authenticated users to create and read donations
*/

-- Add donation columns to posts table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'donation_goal'
  ) THEN
    ALTER TABLE posts ADD COLUMN donation_goal decimal(10,2) DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'total_donations'
  ) THEN
    ALTER TABLE posts ADD COLUMN total_donations decimal(10,2) DEFAULT 0;
  END IF;
END $$;

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create policies for donations
CREATE POLICY "Users can read all donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create their own donations"
  ON donations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS donations_post_id_idx ON donations(post_id);
CREATE INDEX IF NOT EXISTS donations_user_id_idx ON donations(user_id);
CREATE INDEX IF NOT EXISTS donations_created_at_idx ON donations(created_at DESC);

-- Function to update total donations when a new donation is made
CREATE OR REPLACE FUNCTION update_post_donations()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the total_donations for the post
  UPDATE posts 
  SET total_donations = (
    SELECT COALESCE(SUM(amount), 0) 
    FROM donations 
    WHERE post_id = NEW.post_id
  )
  WHERE id = NEW.post_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update total donations
DROP TRIGGER IF EXISTS update_post_donations_trigger ON donations;
CREATE TRIGGER update_post_donations_trigger
  AFTER INSERT ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_post_donations();