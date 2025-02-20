/*
  # Update user management and policies
  
  1. Changes
    - Updates guest and system user management
    - Refreshes RLS policies for all tables
    - Ensures proper policy cleanup
  
  2. Security
    - Maintains RLS on all tables
    - Updates policies for proper access control
    - Handles guest user restrictions
*/

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

-- Update policies
DO $$
BEGIN
  -- Drop all existing policies
  DROP POLICY IF EXISTS "Anyone can read playlists" ON playlists;
  DROP POLICY IF EXISTS "Regular users can modify their playlists" ON playlists;
  DROP POLICY IF EXISTS "Anyone can read songs" ON songs;
  DROP POLICY IF EXISTS "Regular users can modify their songs" ON songs;
  DROP POLICY IF EXISTS "Anyone can read playlist_songs" ON playlist_songs;
  DROP POLICY IF EXISTS "Regular users can manage playlist_songs" ON playlist_songs;
  DROP POLICY IF EXISTS "Users can manage playlist_songs" ON playlist_songs;
  DROP POLICY IF EXISTS "Users can manage playlist_songs for their playlists" ON playlist_songs;

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

  CREATE POLICY "Users can manage playlist_songs"
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