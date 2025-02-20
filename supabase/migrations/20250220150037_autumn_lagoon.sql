/*
  # Update songs to be user-dependent

  1. Changes
    - Update RLS policies for songs table to be user-dependent
    - Add user_id constraint for songs
    - Update existing policies to enforce user ownership

  2. Security
    - Songs are now only readable by their owners
    - Songs can only be created, updated, and deleted by their owners
*/

-- Add NOT NULL constraint to user_id in songs table
ALTER TABLE songs 
  ALTER COLUMN user_id SET NOT NULL;

-- Drop existing policies for songs
DROP POLICY IF EXISTS "Anyone can read songs" ON songs;
DROP POLICY IF EXISTS "Users can create their own songs" ON songs;
DROP POLICY IF EXISTS "Users can update their own songs" ON songs;
DROP POLICY IF EXISTS "Users can delete their own songs" ON songs;

-- Create new policies for songs
CREATE POLICY "Users can read their own songs"
  ON songs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own songs"
  ON songs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own songs"
  ON songs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own songs"
  ON songs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);