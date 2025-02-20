/*
  # Initial Schema Setup for MelodyEd

  1. New Tables
    - `playlists`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `cover_url` (text)
      - `category` (text)
      - `created_by` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)

    - `songs`
      - `id` (uuid, primary key)
      - `title` (text)
      - `artist` (text)
      - `cover_url` (text)
      - `audio_url` (text)
      - `category` (text)
      - `age_range` (text)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamp)

    - `playlist_songs`
      - `id` (uuid, primary key)
      - `playlist_id` (uuid, references playlists)
      - `song_id` (uuid, references songs)
      - `position` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read all playlists and songs
      - Create/update/delete their own playlists and songs
*/

-- Create playlists table
CREATE TABLE playlists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  cover_url text,
  category text,
  created_by text,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create songs table
CREATE TABLE songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  artist text NOT NULL,
  cover_url text,
  audio_url text NOT NULL,
  category text,
  age_range text,
  user_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create playlist_songs junction table
CREATE TABLE playlist_songs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id uuid REFERENCES playlists(id) ON DELETE CASCADE,
  song_id uuid REFERENCES songs(id) ON DELETE CASCADE,
  position integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(playlist_id, position)
);

-- Enable Row Level Security
ALTER TABLE playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_songs ENABLE ROW LEVEL SECURITY;

-- Policies for playlists
CREATE POLICY "Anyone can read playlists"
  ON playlists
  FOR SELECT
  TO authenticated
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
  TO authenticated
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
  TO authenticated
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