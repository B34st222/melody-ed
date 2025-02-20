/*
  # Add hidden items tracking

  1. New Tables
    - `hidden_items`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `item_id` (uuid, the ID of the hidden playlist or song)
      - `item_type` (text, either 'playlist' or 'song')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `hidden_items` table
    - Add policies for users to manage their hidden items
*/

-- Create hidden_items table
CREATE TABLE hidden_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  item_id uuid NOT NULL,
  item_type text NOT NULL CHECK (item_type IN ('playlist', 'song')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE hidden_items ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage their hidden items"
  ON hidden_items
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);