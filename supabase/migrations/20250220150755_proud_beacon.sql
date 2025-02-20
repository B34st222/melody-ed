/*
  # Fix guest user setup and policies

  1. Changes
    - Create guest user with proper credentials and identity
    - Update policies for guest access
  
  2. Security
    - Guest has read-only access
    - Regular users can modify their own data
*/

-- First, ensure the auth.users table exists and has the required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create or update the guest user
DO $$
DECLARE
  guest_user_id uuid := '11111111-1111-1111-1111-111111111111';
  hashed_password text;
BEGIN
  -- Generate hashed password
  hashed_password := crypt('guestpassword123', gen_salt('bf'));

  -- Delete existing guest user if exists
  DELETE FROM auth.users WHERE id = guest_user_id;

  -- Create new guest user
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
    role
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
    'authenticated'
  );

  -- Set up identities for the guest user with provider_id
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
  ) ON CONFLICT (provider, provider_id) DO NOTHING;
END $$;

-- Update policies to ensure guest can read but not modify
DROP POLICY IF EXISTS "Anyone can read playlists" ON playlists;
DROP POLICY IF EXISTS "Anyone can read songs" ON songs;
DROP POLICY IF EXISTS "Regular users can modify their playlists" ON playlists;
DROP POLICY IF EXISTS "Regular users can modify their songs" ON songs;

-- Create read-only policies for guest and authenticated users
CREATE POLICY "Anyone can read playlists"
  ON playlists
  FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read songs"
  ON songs
  FOR SELECT
  USING (true);

-- Create policies for non-guest users to modify their own data
CREATE POLICY "Regular users can modify their playlists"
  ON playlists
  FOR ALL
  TO authenticated
  USING (
    auth.uid() != '11111111-1111-1111-1111-111111111111' 
    AND auth.uid() = user_id
  );

CREATE POLICY "Regular users can modify their songs"
  ON songs
  FOR ALL
  TO authenticated
  USING (
    auth.uid() != '11111111-1111-1111-1111-111111111111'
    AND auth.uid() = user_id
  );