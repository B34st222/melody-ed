import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please click "Connect to Supabase" button to set up your connection.');
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    },
    global: {
      headers: { 'x-application-name': 'melody-ed' }
    }
  }
);

// Test the connection
supabase.from('playlists').select('count').single()
  .then(() => console.log('✅ Supabase connection successful'))
  .catch(error => {
    console.error('❌ Supabase connection failed:', error.message);
    if (error.message.includes('FetchError') || error.message.includes('Failed to fetch')) {
      console.error('Please ensure you have clicked the "Connect to Supabase" button and have valid credentials.');
    }
  });