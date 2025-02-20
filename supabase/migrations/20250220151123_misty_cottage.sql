/*
  # Update policies for guest access

  1. Changes
    - Remove guest restrictions from all policies
    - Allow guests to create and manage playlists and songs
    - Update playlist_songs policies for guest access

  2. Security
    - All authenticated users (including guests) have full access
    - System content remains accessible to all
*/

-- Update policies
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Anyone can read playlists" ON playlists;
  DROP POLICY IF EXISTS "Anyone can read songs" ON songs;
  DROP POLICY IF EXISTS "Regular users can modify their playlists" ON playlists;
  DROP POLICY IF EXISTS "Regular users can modify their songs" ON songs;
  DROP POLICY IF EXISTS "Regular users can manage playlist_songs" ON playlist_songs;
  DROP POLICY IF EXISTS "Anyone can read playlist_songs" ON playlist_songs;

  -- Create new policies that treat all users equally
  -- Playlists
  CREATE POLICY "Anyone can read playlists"
    ON playlists
    FOR SELECT
    USING (true);

  CREATE POLICY "Users can modify their playlists"
    ON playlists
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

  -- Songs
  CREATE POLICY "Anyone can read songs"
    ON songs
    FOR SELECT
    USING (true);

  CREATE POLICY "Users can modify their songs"
    ON songs
    FOR ALL
    TO authenticated
    USING (auth.uid() = user_id);

  -- Playlist Songs
  CREATE POLICY "Anyone can read playlist_songs"
    ON playlist_songs
    FOR SELECT
    USING (true);

  CREATE POLICY "Users can manage playlist_songs"
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
END $$;