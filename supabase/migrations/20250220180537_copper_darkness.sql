-- First, ensure the auth.users table exists and has the required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create or update the guest user
DO $$
DECLARE
  guest_user_id uuid := '11111111-1111-1111-1111-111111111111';
  system_user_id uuid := '00000000-0000-0000-0000-000000000000';
  hashed_password text;
BEGIN
  -- Generate hashed password for guest
  hashed_password := crypt('guestpassword123', gen_salt('bf'));

  -- Update or insert guest user
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    instance_id,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    guest_user_id,
    'guest@example.com',
    hashed_password,
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"Guest User"}',
    'authenticated',
    'authenticated',
    '00000000-0000-0000-0000-000000000000',
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    encrypted_password = EXCLUDED.encrypted_password,
    updated_at = now();

  -- Set up identities for the guest user
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    created_at,
    updated_at,
    last_sign_in_at
  ) VALUES (
    guest_user_id,
    guest_user_id,
    jsonb_build_object('sub', guest_user_id, 'email', 'guest@example.com'),
    'email',
    'guest@example.com',
    now(),
    now(),
    now()
  ) ON CONFLICT (provider, provider_id) DO UPDATE SET
    last_sign_in_at = now(),
    updated_at = now();

  -- Create system user if not exists
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    aud,
    role,
    instance_id,
    confirmation_token,
    recovery_token,
    email_change_token_new,
    email_change
  ) VALUES (
    system_user_id,
    'system@example.com',
    'SYSTEM_USER',
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"name":"System"}',
    'authenticated',
    'authenticated',
    '00000000-0000-0000-0000-000000000000',
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;
END $$;

-- Clear existing data
TRUNCATE playlist_songs CASCADE;
TRUNCATE songs CASCADE;
TRUNCATE playlists CASCADE;

-- Create system-owned playlists and songs
DO $$
DECLARE
  system_user_id uuid := '00000000-0000-0000-0000-000000000000';
  math_playlist_id uuid;
  science_playlist_id uuid;
  reading_playlist_id uuid;
BEGIN
  -- Create playlists
  INSERT INTO playlists (id, name, description, cover_url, category, created_by, user_id)
  VALUES 
    ('d290f1ee-6c54-4b01-90e6-d701748f0851', 'Math Fun Songs', 'Songs that make learning math fun!', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800', 'Mathematics', 'System', system_user_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0852', 'Science Adventures', 'Musical journey through scientific concepts', 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800', 'Science', 'System', system_user_id),
    ('d290f1ee-6c54-4b01-90e6-d701748f0853', 'Reading Rhythms', 'Songs that help with reading and phonics', 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=800', 'Language Arts', 'System', system_user_id);

  -- Create songs
  INSERT INTO songs (id, title, artist, cover_url, audio_url, category, age_range, user_id)
  VALUES
    ('e290f1ee-6c54-4b01-90e6-d701748f0851', 'Multiplication Rap', 'Math Masters', 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800', 'https://assets.mixkit.co/music/preview/mixkit-tech-house-vibes-130.mp3', 'Mathematics', '7-10', system_user_id),
    ('e290f1ee-6c54-4b01-90e6-d701748f0852', 'Addition Adventure', 'Number Ninjas', 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800', 'https://assets.mixkit.co/music/preview/mixkit-hip-hop-02-738.mp3', 'Mathematics', '6-8', system_user_id),
    ('e290f1ee-6c54-4b01-90e6-d701748f0853', 'The Solar System Song', 'Science Kids', 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=800', 'https://assets.mixkit.co/music/preview/mixkit-games-worldbeat-466.mp3', 'Science', '8-12', system_user_id),
    ('e290f1ee-6c54-4b01-90e6-d701748f0854', 'States of Matter', 'Lab Rats', 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800', 'https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3', 'Science', '9-11', system_user_id),
    ('e290f1ee-6c54-4b01-90e6-d701748f0855', 'Phonics Fun', 'Reading Rangers', 'https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=800', 'https://assets.mixkit.co/music/preview/mixkit-happy-guitar-chords-2319.mp3', 'Language Arts', '5-8', system_user_id);

  -- Create playlist_songs relationships
  INSERT INTO playlist_songs (id, playlist_id, song_id, position)
  VALUES
    ('f290f1ee-6c54-4b01-90e6-d701748f0851', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'e290f1ee-6c54-4b01-90e6-d701748f0851', 1),
    ('f290f1ee-6c54-4b01-90e6-d701748f0852', 'd290f1ee-6c54-4b01-90e6-d701748f0851', 'e290f1ee-6c54-4b01-90e6-d701748f0852', 2),
    ('f290f1ee-6c54-4b01-90e6-d701748f0853', 'd290f1ee-6c54-4b01-90e6-d701748f0852', 'e290f1ee-6c54-4b01-90e6-d701748f0853', 1),
    ('f290f1ee-6c54-4b01-90e6-d701748f0854', 'd290f1ee-6c54-4b01-90e6-d701748f0852', 'e290f1ee-6c54-4b01-90e6-d701748f0854', 2),
    ('f290f1ee-6c54-4b01-90e6-d701748f0855', 'd290f1ee-6c54-4b01-90e6-d701748f0853', 'e290f1ee-6c54-4b01-90e6-d701748f0855', 1);
END $$;

-- Update policies
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Anyone can read playlists" ON playlists;
  DROP POLICY IF EXISTS "Anyone can read songs" ON songs;
  DROP POLICY IF EXISTS "Regular users can modify their playlists" ON playlists;
  DROP POLICY IF EXISTS "Regular users can modify their songs" ON songs;
  DROP POLICY IF EXISTS "Users can manage playlist_songs for their playlists" ON playlist_songs;
  DROP POLICY IF EXISTS "Anyone can read playlist_songs" ON playlist_songs;

  -- Create new policies
  -- Playlists
  CREATE POLICY "Anyone can read playlists"
    ON playlists
    FOR SELECT
    USING (true);

  CREATE POLICY "Regular users can modify their playlists"
    ON playlists
    FOR ALL
    TO authenticated
    USING (
      auth.uid() != '11111111-1111-1111-1111-111111111111'
      AND auth.uid() = user_id
    );

  -- Songs
  CREATE POLICY "Anyone can read songs"
    ON songs
    FOR SELECT
    USING (true);

  CREATE POLICY "Regular users can modify their songs"
    ON songs
    FOR ALL
    TO authenticated
    USING (
      auth.uid() != '11111111-1111-1111-1111-111111111111'
      AND auth.uid() = user_id
    );

  -- Playlist Songs
  CREATE POLICY "Anyone can read playlist_songs"
    ON playlist_songs
    FOR SELECT
    USING (true);

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
END $$;