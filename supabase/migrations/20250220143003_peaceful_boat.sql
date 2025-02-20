/*
  # Re-enable RLS and set up policies
  
  1. Security Changes
    - Re-enable RLS for all tables
    - Add policies for authenticated users
    - Add policies for public read access
*/

-- Create function to enable RLS
CREATE OR REPLACE FUNCTION enable_rls()
RETURNS void AS $$
BEGIN
  -- Enable RLS
  ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
  ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
  ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

  -- Policies for playlists
  CREATE POLICY "Anyone can read playlists"
    ON playlists
    FOR SELECT
    USING (true);

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

  -- Policies for songs
  CREATE POLICY "Anyone can read songs"
    ON songs
    FOR SELECT
    USING (true);

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

  -- Policies for playlist_songs
  CREATE POLICY "Anyone can read playlist_songs"
    ON playlist_songs
    FOR SELECT
    USING (true);

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
END;
$$ LANGUAGE plpgsql;