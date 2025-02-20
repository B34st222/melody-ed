/*
  # Update audio URLs and policies

  1. Changes
    - Update audio URLs to use SoundHelix samples
    - Fix policy creation to handle existing policies
  
  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control for all tables
*/

-- Update song audio URLs to use SoundHelix samples
UPDATE songs
SET audio_url = CASE id
  WHEN 'e290f1ee-6c54-4b01-90e6-d701748f0851' THEN 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'
  WHEN 'e290f1ee-6c54-4b01-90e6-d701748f0852' THEN 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
  WHEN 'e290f1ee-6c54-4b01-90e6-d701748f0853' THEN 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
  WHEN 'e290f1ee-6c54-4b01-90e6-d701748f0854' THEN 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3'
  WHEN 'e290f1ee-6c54-4b01-90e6-d701748f0855' THEN 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
END
WHERE id IN (
  'e290f1ee-6c54-4b01-90e6-d701748f0851',
  'e290f1ee-6c54-4b01-90e6-d701748f0852',
  'e290f1ee-6c54-4b01-90e6-d701748f0853',
  'e290f1ee-6c54-4b01-90e6-d701748f0854',
  'e290f1ee-6c54-4b01-90e6-d701748f0855'
);

-- Safely update policies
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Anyone can read playlists" ON playlists;
  DROP POLICY IF EXISTS "Anyone can read songs" ON songs;
  DROP POLICY IF EXISTS "Anyone can read playlist_songs" ON playlist_songs;
  DROP POLICY IF EXISTS "Regular users can modify their playlists" ON playlists;
  DROP POLICY IF EXISTS "Regular users can modify their songs" ON songs;
  DROP POLICY IF EXISTS "Regular users can manage playlist_songs" ON playlist_songs;
  DROP POLICY IF EXISTS "Users can manage playlist_songs" ON playlist_songs;

  -- Create new policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'playlists' AND policyname = 'Anyone can read playlists'
  ) THEN
    CREATE POLICY "Anyone can read playlists"
      ON playlists
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'playlists' AND policyname = 'Regular users can modify their playlists'
  ) THEN
    CREATE POLICY "Regular users can modify their playlists"
      ON playlists
      FOR ALL
      TO authenticated
      USING (
        auth.uid() != '11111111-1111-1111-1111-111111111111'
        AND auth.uid() = user_id
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'songs' AND policyname = 'Anyone can read songs'
  ) THEN
    CREATE POLICY "Anyone can read songs"
      ON songs
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'songs' AND policyname = 'Regular users can modify their songs'
  ) THEN
    CREATE POLICY "Regular users can modify their songs"
      ON songs
      FOR ALL
      TO authenticated
      USING (
        auth.uid() != '11111111-1111-1111-1111-111111111111'
        AND auth.uid() = user_id
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'playlist_songs' AND policyname = 'Anyone can read playlist_songs'
  ) THEN
    CREATE POLICY "Anyone can read playlist_songs"
      ON playlist_songs
      FOR SELECT
      USING (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'playlist_songs' AND policyname = 'Regular users can manage playlist_songs'
  ) THEN
    CREATE POLICY "Regular users can manage playlist_songs"
      ON playlist_songs
      FOR ALL
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM playlists
          WHERE id = playlist_songs.playlist_id
          AND user_id = auth.uid()
          AND auth.uid() != '11111111-1111-1111-1111-111111111111'
        )
      );
  END IF;
END $$;