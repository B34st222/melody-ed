import { createClient } from '@supabase/supabase-js';
import { playlists } from '../../data/playlists.json';
import { songs } from '../../data/songs.json';
import { playlist_songs } from '../../data/playlist_songs.json';
import { config } from 'dotenv';
import { Database } from '../lib/database.types';

// Load environment variables
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

async function importData() {
  try {
    console.log('Starting data import...');

    // Import playlists
    console.log('Importing playlists...');
    const { error: playlistsError } = await supabase
      .from('playlists')
      .upsert(playlists, { 
        onConflict: 'id',
        ignoreDuplicates: true 
      });
    
    if (playlistsError) throw playlistsError;
    console.log('✅ Playlists imported successfully');

    // Import songs
    console.log('Importing songs...');
    const { error: songsError } = await supabase
      .from('songs')
      .upsert(songs, {
        onConflict: 'id',
        ignoreDuplicates: true
      });
    
    if (songsError) throw songsError;
    console.log('✅ Songs imported successfully');

    // Import playlist_songs
    console.log('Importing playlist_songs...');
    const { error: playlistSongsError } = await supabase
      .from('playlist_songs')
      .upsert(playlist_songs, {
        onConflict: 'id',
        ignoreDuplicates: true
      });
    
    if (playlistSongsError) throw playlistSongsError;
    console.log('✅ Playlist_songs imported successfully');

    console.log('✅ All data imported successfully!');

    // Re-enable RLS
    await supabase.rpc('enable_rls');
    console.log('✅ RLS re-enabled');

  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
}