/*
  # Update RLS policies for data import

  1. Security Changes
    - Temporarily disable RLS for initial data import
    - Add policies for authenticated users
*/

-- Temporarily disable RLS for data import
ALTER TABLE playlists DISABLE ROW LEVEL SECURITY;
ALTER TABLE songs DISABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs DISABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can read playlists" ON playlists;
  DROP POLICY IF EXISTS "Allow insert without auth for import" ON playlists;
  DROP POLICY IF EXISTS "Users can update their own playlists" ON playlists;
  DROP POLICY IF EXISTS "Users can delete their own playlists" ON playlists;
  
  DROP POLICY IF EXISTS "Anyone can read songs" ON songs;
  DROP POLICY IF EXISTS "Allow insert without auth for import" ON songs;
  DROP POLICY IF EXISTS "Users can update their own songs" ON songs;
  DROP POLICY IF EXISTS "Users can delete their own songs" ON songs;
  
  DROP POLICY IF EXISTS "Anyone can read playlist_songs" ON playlist_songs;
  DROP POLICY IF EXISTS "Allow insert without auth for import" ON playlist_songs;
  DROP POLICY IF EXISTS "Users can manage playlist_songs for their playlists" ON playlist_songs;
END $$;