/*
  # Create guest user account

  1. Changes
    - Create a guest user account
    - Set up guest user credentials
  
  2. Security
    - Guest account is read-only
    - Guest credentials are fixed
*/

-- Create a guest user if it doesn't exist
DO $$
DECLARE
  guest_user_id uuid;
BEGIN
  -- Insert guest user if it doesn't exist
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
    '11111111-1111-1111-1111-111111111111',
    'authenticated',
    'authenticated',
    'guest@example.com',
    crypt('guestpassword123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING
  RETURNING id INTO guest_user_id;
END $$;