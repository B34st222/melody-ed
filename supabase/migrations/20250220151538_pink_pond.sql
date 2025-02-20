/*
  # Update RLS policies for system songs access

  1. Changes
    - Modify song policies to allow reading system user's songs
    - Modify playlist policies to allow reading system user's playlists
    - Modify playlist_songs policies to allow reading system user's relationships

  2. Security
    - Maintain write protection for system user's data
    - Keep existing user permissions intact
*/

-- Update policies to allow reading system user's content
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Anyone can read songs" ON songs;
  DROP POLICY IF EXISTS "Anyone can read playlists" ON playlists;
  DROP POLICY IF EXISTS "Anyone can read playlist_songs" ON playlist_songs;

  -- Create new policies that include system user's content
  CREATE POLICY "Anyone can read songs"
    ON songs
    FOR SELECT
    USING (
      user_id = '00000000-0000-0000-0000-000000000000' OR
      user_id = auth.uid()
    );

  CREATE POLICY "Anyone can read playlists"
    ON playlists
    FOR SELECT
    USING (
      user_id = '00000000-0000-0000-0000-000000000000' OR
      user_id = auth.uid()
    );

  CREATE POLICY "Anyone can read playlist_songs"
    ON playlist_songs
    FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM playlists
        WHERE id = playlist_songs.playlist_id
        AND (
          user_id = '00000000-0000-0000-0000-000000000000' OR
          user_id = auth.uid()
        )
      )
    );
END $$;