import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Playlist, Song, PlaylistSong } from '../types';
import { useAuth } from './useAuth';

export const useSupabase = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching playlists...');

      // Fetch playlists
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select('*')
        .order('created_at', { ascending: false });

      if (playlistsError) {
        console.error('Error fetching playlists:', playlistsError);
        throw playlistsError;
      }

      console.log('Fetched playlists:', playlistsData);

      // Fetch user's songs
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (songsError) {
        console.error('Error fetching songs:', songsError);
        throw songsError;
      }

      console.log('Fetched songs:', songsData);

      const { data: playlistSongsData, error: playlistSongsError } = await supabase
        .from('playlist_songs')
        .select('*')
        .order('position', { ascending: true });

      if (playlistSongsError) {
        console.error('Error fetching playlist_songs:', playlistSongsError);
        throw playlistSongsError;
      }

      console.log('Fetched playlist_songs:', playlistSongsData);

      // Map songs to their playlists
      const playlistsWithSongs = playlistsData.map((playlist: Playlist) => {
        const playlistSongs = playlistSongsData
          .filter((ps: PlaylistSong) => ps.playlist_id === playlist.id)
          .map((ps: PlaylistSong) => {
            const song = songsData.find((s: Song) => s.id === ps.song_id);
            return song;
          })
          .filter(Boolean);

        return {
          ...playlist,
          songs: playlistSongs
        };
      });

      console.log('Final playlists with songs:', playlistsWithSongs);
      setPlaylists(playlistsWithSongs);
    } catch (err) {
      console.error('Error in fetchPlaylists:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addSong = async (playlistId: string, newSong: Omit<Song, 'id' | 'user_id' | 'created_at'>) => {
    try {
      if (!user) throw new Error('User must be authenticated to add songs');
      
      console.log('Adding new song:', newSong);
      
      // Insert the song with user_id
      const { data: songData, error: songError } = await supabase
        .from('songs')
        .insert([{
          ...newSong,
          user_id: user.id
        }])
        .select()
        .single();

      if (songError) {
        console.error('Error inserting song:', songError);
        throw songError;
      }

      console.log('Song inserted:', songData);

      // Get the current highest position
      const { data: positionData } = await supabase
        .from('playlist_songs')
        .select('position')
        .eq('playlist_id', playlistId)
        .order('position', { ascending: false })
        .limit(1)
        .maybeSingle();

      // If no songs exist yet, start at position 1, otherwise increment the highest position
      const nextPosition = (positionData?.position || 0) + 1;
      console.log('Next position:', nextPosition);

      // Insert the playlist_song relationship
      const { error: relationError } = await supabase
        .from('playlist_songs')
        .insert([{
          playlist_id: playlistId,
          song_id: songData.id,
          position: nextPosition
        }]);

      if (relationError) {
        console.error('Error creating playlist_song relation:', relationError);
        throw relationError;
      }

      // Refresh the playlists
      await fetchPlaylists();
    } catch (err) {
      console.error('Error in addSong:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const createPlaylist = async (newPlaylist: Omit<Playlist, 'id' | 'user_id' | 'created_at' | 'songs'>) => {
    try {
      if (!user) throw new Error('User must be authenticated to create playlists');
      
      console.log('Creating new playlist:', newPlaylist);
      
      const { data, error } = await supabase
        .from('playlists')
        .insert([{
          ...newPlaylist,
          user_id: user.id
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating playlist:', error);
        throw error;
      }

      console.log('Playlist created:', data);
      await fetchPlaylists();
    } catch (err) {
      console.error('Error in createPlaylist:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  useEffect(() => {
    if (user) {
      fetchPlaylists();
    }
  }, [user]);

  return {
    playlists,
    loading,
    error,
    addSong,
    createPlaylist,
    refreshPlaylists: fetchPlaylists
  };
};