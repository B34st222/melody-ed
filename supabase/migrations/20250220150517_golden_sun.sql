/*
  # Make playlists user-dependent

  1. Changes
    - Remove all existing playlists and relationships
    - Enforce user ownership of playlists
    - Update playlist policies for user-based access

  2. Security
    - Each user can only see and manage their own playlists
    - All playlists must have an owner
*/

-- First, remove all existing playlist relationships and playlists
DELETE FROM playlist_songs;
DELETE FROM playlists;

-- Drop existing policies for playlists
DROP POLICY IF EXISTS "Anyone can read playlists" ON playlists;
DROP POLICY IF EXISTS "Users can create their own playlists" ON playlists;
DROP POLICY IF EXISTS "Users can update their own playlists" ON playlists;
DROP POLICY IF EXISTS "Users can delete their own playlists" ON playlists;

-- Create new policies for playlists
CREATE POLICY "Users can read their own playlists"
  ON playlists
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own playlists"
  ON playlists
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own playlists"
  ON playlists
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
  ON playlists
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);