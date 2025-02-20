/*
  # Make playlist description and cover_url optional

  1. Changes
    - Remove NOT NULL constraint from description and cover_url columns in playlists table
    - Add default value for cover_url

  2. Security
    - No security changes required
    - Existing RLS policies remain unchanged
*/

-- Make description and cover_url optional
ALTER TABLE playlists
  ALTER COLUMN description DROP NOT NULL,
  ALTER COLUMN cover_url DROP NOT NULL,
  ALTER COLUMN cover_url SET DEFAULT 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800';