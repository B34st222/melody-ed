/*
  # Clean slate for user songs

  1. Changes
    - Remove system user approach
    - Delete existing songs to start fresh
    - Maintain NOT NULL constraint on user_id
    - Keep user-dependent policies

  2. Security
    - Songs remain user-dependent
    - Each user starts with no songs
*/

-- First, remove all existing songs and their playlist relationships
DELETE FROM playlist_songs;
DELETE FROM songs;

-- Drop existing policies for songs
DROP POLICY IF EXISTS "Users can read their own songs" ON songs;
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