/*
  # Add RLS policies for likes and comments tables

  1. Security
    - Enable RLS on likes and comments tables
    - Add policies for authenticated users to manage their own likes and comments
    - Add policies for reading all likes and comments

  2. Changes
    - Enable RLS on likes table
    - Enable RLS on comments table
    - Add insert/delete policies for likes
    - Add insert/select policies for comments
*/

-- Enable RLS on likes table
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Enable RLS on comments table  
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- Likes policies
CREATE POLICY "Users can insert their own likes"
  ON likes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own likes"
  ON likes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read all likes"
  ON likes
  FOR SELECT
  TO authenticated
  USING (true);

-- Comments policies
CREATE POLICY "Users can insert their own comments"
  ON comments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read all comments"
  ON comments
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own comments"
  ON comments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);