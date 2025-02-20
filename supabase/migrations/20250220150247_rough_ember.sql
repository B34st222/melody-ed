/*
  # Make songs user-dependent

  1. Changes
    - Create a default system user for existing songs
    - Update existing songs to use the system user
    - Make user_id NOT NULL
    - Update RLS policies to be user-dependent

  2. Security
    - Songs are now only readable by their owners
    - Songs can only be created, updated, and deleted by their owners
*/

-- Create a system user for existing songs if it doesn't exist
DO $$
DECLARE
  system_user_id uuid;
BEGIN
  -- Insert a system user if it doesn't exist
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at
  )
  VALUES (
    '00000000-0000-0000-0000-000000000000',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'system@example.com',
    'SYSTEM_USER',
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO system_user_id;

  -- Update existing songs with null user_id to use the system user
  UPDATE songs
  SET user_id = '00000000-0000-0000-0000-000000000000'
  WHERE user_id IS NULL;
END $$;

-- Now we can safely add the NOT NULL constraint
ALTER TABLE songs 
  ALTER COLUMN user_id SET NOT NULL;

-- Drop existing policies for songs
DROP POLICY IF EXISTS "Anyone can read songs" ON songs;
DROP POLICY IF EXISTS "Users can create their own songs" ON songs;
DROP POLICY IF EXISTS "Users can update their own songs" ON songs;
DROP POLICY IF EXISTS "Users can delete their own songs" ON songs;

-- Create new policies for songs
CREATE POLICY "Users can read their own songs"
  ON songs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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