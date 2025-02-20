/*
  # Add More Educational Songs

  1. New Songs
    - Add more educational songs across different subjects:
      - Mathematics: Division Dance, Geometry Groove
      - Science: Chemistry Beats, Biology Basics
      - Language Arts: Grammar Groove, Vocabulary Vibes
      - History: Ancient Times, World Explorers
      - Geography: Continents Song, Weather Wonders

  2. Playlist Relationships
    - Add new songs to existing playlists
    - Maintain proper position ordering
*/

-- Add new songs
INSERT INTO songs (id, title, artist, cover_url, audio_url, category, age_range, user_id)
VALUES
  -- Math Songs
  (gen_random_uuid(), 'Division Dance', 'Math Masters', 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3', 'Mathematics', '8-11', '00000000-0000-0000-0000-000000000000'),
  (gen_random_uuid(), 'Geometry Groove', 'Number Ninjas', 'https://images.unsplash.com/photo-1509228627152-72ae9ae6848d?w=800', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3', 'Mathematics', '9-12', '00000000-0000-0000-0000-000000000000'),
  
  -- Science Songs
  (gen_random_uuid(), 'Chemistry Beats', 'Lab Rats', 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?w=800', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3', 'Science', '10-13', '00000000-0000-0000-0000-000000000000'),
  (gen_random_uuid(), 'Biology Basics', 'Science Kids', 'https://images.unsplash.com/photo-1530026405186-ed1f139313f8?w=800', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3', 'Science', '9-12', '00000000-0000-0000-0000-000000000000'),
  
  -- Language Arts Songs
  (gen_random_uuid(), 'Grammar Groove', 'Reading Rangers', 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3', 'Language Arts', '7-10', '00000000-0000-0000-0000-000000000000'),
  (gen_random_uuid(), 'Vocabulary Vibes', 'Word Wizards', 'https://images.unsplash.com/photo-1526040652367-ac003a0475fe?w=800', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-10.mp3', 'Language Arts', '8-11', '00000000-0000-0000-0000-000000000000'),
  
  -- History Songs
  (gen_random_uuid(), 'Ancient Times', 'History Heroes', 'https://images.unsplash.com/photo-1608425234255-96a29cce8e6b?w=800', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-11.mp3', 'History', '9-12', '00000000-0000-0000-0000-000000000000'),
  (gen_random_uuid(), 'World Explorers', 'Time Travelers', 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-12.mp3', 'History', '10-13', '00000000-0000-0000-0000-000000000000'),
  
  -- Geography Songs
  (gen_random_uuid(), 'Continents Song', 'Globe Trotters', 'https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?w=800', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-13.mp3', 'Geography', '7-10', '00000000-0000-0000-0000-000000000000'),
  (gen_random_uuid(), 'Weather Wonders', 'Earth Explorers', 'https://images.unsplash.com/photo-1526702485554-0fa6a8d60beb?w=800', 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-14.mp3', 'Geography', '8-11', '00000000-0000-0000-0000-000000000000');

-- Add new songs to existing playlists
WITH new_songs AS (
  SELECT id, title, category FROM songs 
  WHERE title IN ('Division Dance', 'Geometry Groove')
)
INSERT INTO playlist_songs (id, playlist_id, song_id, position)
SELECT 
  gen_random_uuid(),
  'd290f1ee-6c54-4b01-90e6-d701748f0851',
  new_songs.id,
  ROW_NUMBER() OVER (ORDER BY new_songs.title) + (
    SELECT COALESCE(MAX(position), 0)
    FROM playlist_songs
    WHERE playlist_id = 'd290f1ee-6c54-4b01-90e6-d701748f0851'
  )
FROM new_songs
WHERE new_songs.category = 'Mathematics';

WITH new_songs AS (
  SELECT id, title, category FROM songs 
  WHERE title IN ('Chemistry Beats', 'Biology Basics')
)
INSERT INTO playlist_songs (id, playlist_id, song_id, position)
SELECT 
  gen_random_uuid(),
  'd290f1ee-6c54-4b01-90e6-d701748f0852',
  new_songs.id,
  ROW_NUMBER() OVER (ORDER BY new_songs.title) + (
    SELECT COALESCE(MAX(position), 0)
    FROM playlist_songs
    WHERE playlist_id = 'd290f1ee-6c54-4b01-90e6-d701748f0852'
  )
FROM new_songs
WHERE new_songs.category = 'Science';

WITH new_songs AS (
  SELECT id, title, category FROM songs 
  WHERE title IN ('Grammar Groove', 'Vocabulary Vibes')
)
INSERT INTO playlist_songs (id, playlist_id, song_id, position)
SELECT 
  gen_random_uuid(),
  'd290f1ee-6c54-4b01-90e6-d701748f0853',
  new_songs.id,
  ROW_NUMBER() OVER (ORDER BY new_songs.title) + (
    SELECT COALESCE(MAX(position), 0)
    FROM playlist_songs
    WHERE playlist_id = 'd290f1ee-6c54-4b01-90e6-d701748f0853'
  )
FROM new_songs
WHERE new_songs.category = 'Language Arts';