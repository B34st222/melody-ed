/*
  # Add RLS policies for data import

  1. Security Changes
    - Add policies to allow data import without authentication
    - Maintain existing security policies for authenticated users
    - Enable RLS on all tables
*/

-- Enable Row Level Security (if not already enabled)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'playlists' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'songs' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'playlist_songs' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

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

-- Policies for playlists
CREATE POLICY "Anyone can read playlists"
  ON playlists
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert without auth for import"
  ON playlists
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own playlists"
  ON playlists
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own playlists"
  ON playlists
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for songs
CREATE POLICY "Anyone can read songs"
  ON songs
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert without auth for import"
  ON songs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update their own songs"
  ON songs
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own songs"
  ON songs
  FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for playlist_songs
CREATE POLICY "Anyone can read playlist_songs"
  ON playlist_songs
  FOR SELECT
  USING (true);

CREATE POLICY "Allow insert without auth for import"
  ON playlist_songs
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can manage playlist_songs for their playlists"
  ON playlist_songs
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM playlists
      WHERE id = playlist_songs.playlist_id
      AND user_id = auth.uid()
    )
  );