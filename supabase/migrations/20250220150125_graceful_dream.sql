/*
  # Update songs to be user-dependent

  1. Changes
    - Update existing null user_ids with a default value
    - Make user_id NOT NULL
    - Update RLS policies for songs table to be user-dependent

  2. Security
    - Songs are now only readable by their owners
    - Songs can only be created, updated, and deleted by their owners
*/

-- First, update any existing null user_ids with a default value
UPDATE songs
SET user_id = auth.uid()
WHERE user_id IS NULL;

-- Now we can safely add the NOT NULL constraint
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