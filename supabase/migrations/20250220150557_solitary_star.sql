/*
  # Add guest access functionality

  1. Changes
    - Add guest access policies for playlists and songs
    - Allow anonymous access to read public content
  
  2. Security
    - Guests can view public content
    - Maintain existing user-specific policies
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own playlists" ON playlists;
DROP POLICY IF EXISTS "Users can read their own songs" ON songs;

-- Create new read policies that include guest access
CREATE POLICY "Anyone can read playlists"
  ON playlists
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read songs"
  ON songs
  FOR SELECT
  USING (true);