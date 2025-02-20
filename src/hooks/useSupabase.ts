import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Playlist, Song, PlaylistSong } from '../types';
import { useAuth } from './useAuth';

export const useSupabase = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isGuest } = useAuth();

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching playlists...');

      // Get user's hidden items
      const { data: hiddenItems, error: hiddenError } = await supabase
        .from('hidden_items')
        .select('item_id, item_type')
        .eq('user_id', user?.id);

      if (hiddenError) {
        console.error('Error fetching hidden items:', hiddenError);
        throw hiddenError;
      }

      const hiddenPlaylists = new Set(
        hiddenItems
          ?.filter(item => item.item_type === 'playlist')
          .map(item => item.item_id)
      );

      const hiddenSongs = new Set(
        hiddenItems
          ?.filter(item => item.item_type === 'song')
          .map(item => item.item_id)
      );

      // For guest users, only fetch system playlists
      // For regular users, fetch their playlists and system playlists
      const { data: playlistsData, error: playlistsError } = await supabase
        .from('playlists')
        .select('*')
        .or(`user_id.eq.00000000-0000-0000-0000-000000000000${!isGuest ? `,user_id.eq.${user?.id}` : ''}`);

      if (playlistsError) {
        console.error('Error fetching playlists:', playlistsError);
        throw playlistsError;
      }

      // Filter out hidden playlists
      const visiblePlaylists = playlistsData.filter(
        playlist => !hiddenPlaylists.has(playlist.id)
      );

      // Fetch songs with the same logic
      const { data: songsData, error: songsError } = await supabase
        .from('songs')
        .select('*')
        .or(`user_id.eq.00000000-0000-0000-0000-000000000000${!isGuest ? `,user_id.eq.${user?.id}` : ''}`);

      if (songsError) {
        console.error('Error fetching songs:', songsError);
        throw songsError;
      }

      // Filter out hidden songs
      const visibleSongs = songsData.filter(
        song => !hiddenSongs.has(song.id)
      );

      const { data: playlistSongsData, error: playlistSongsError } = await supabase
        .from('playlist_songs')
        .select('*')
        .order('position', { ascending: true });

      if (playlistSongsError) {
        console.error('Error fetching playlist_songs:', playlistSongsError);
        throw playlistSongsError;
      }

      // Map songs to their playlists
      const playlistsWithSongs = visiblePlaylists.map((playlist: Playlist) => {
        const playlistSongs = playlistSongsData
          .filter((ps: PlaylistSong) => ps.playlist_id === playlist.id)
          .map((ps: PlaylistSong) => {
            const song = visibleSongs.find((s: Song) => s.id === ps.song_id);
            return song;
          })
          .filter(Boolean);

        return {
          ...playlist,
          songs: playlistSongs
        };
      });

      setPlaylists(playlistsWithSongs);
    } catch (err) {
      console.error('Error in fetchPlaylists:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const hideItem = async (itemId: string, itemType: 'playlist' | 'song') => {
    try {
      if (!user) throw new Error('User must be authenticated to hide items');
      if (isGuest) throw new Error('Guest users cannot hide items');

      const { error } = await supabase
        .from('hidden_items')
        .insert([{
          user_id: user.id,
          item_id: itemId,
          item_type: itemType
        }]);

      if (error) {
        console.error('Error hiding item:', error);
        throw error;
      }

      await fetchPlaylists();
    } catch (err) {
      console.error('Error in hideItem:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const addSong = async (playlistId: string, newSong: Omit<Song, 'id' | 'user_id' | 'created_at'>) => {
    try {
      if (!user) throw new Error('User must be authenticated to add songs');
      if (isGuest) throw new Error('Guest users cannot add songs');
      
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
      if (isGuest) throw new Error('Guest users cannot create playlists');
      
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

  const deletePlaylist = async (playlistId: string) => {
    try {
      if (!user) throw new Error('User must be authenticated to delete playlists');
      if (isGuest) throw new Error('Guest users cannot delete playlists');

      // Delete the playlist (cascade will handle playlist_songs)
      const { error } = await supabase
        .from('playlists')
        .delete()
        .eq('id', playlistId)
        .eq('user_id', user.id); // Ensure user owns the playlist

      if (error) {
        console.error('Error deleting playlist:', error);
        throw error;
      }

      await fetchPlaylists();
    } catch (err) {
      console.error('Error in deletePlaylist:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const deleteSong = async (songId: string, playlistId: string) => {
    try {
      if (!user) throw new Error('User must be authenticated to delete songs');
      if (isGuest) throw new Error('Guest users cannot delete songs');

      // First remove the song from the playlist
      const { error: relationError } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('song_id', songId)
        .eq('playlist_id', playlistId);

      if (relationError) {
        console.error('Error removing song from playlist:', relationError);
        throw relationError;
      }

      // Then delete the song if it belongs to the user
      const { error: songError } = await supabase
        .from('songs')
        .delete()
        .eq('id', songId)
        .eq('user_id', user.id); // Ensure user owns the song

      if (songError) {
        console.error('Error deleting song:', songError);
        throw songError;
      }

      await fetchPlaylists();
    } catch (err) {
      console.error('Error in deleteSong:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    }
  };

  const removeSongFromPlaylist = async (songId: string, playlistId: string) => {
    try {
      if (!user) throw new Error('User must be authenticated to remove songs from playlists');
      if (isGuest) throw new Error('Guest users cannot modify playlists');

      // Remove the song from the playlist
      const { error: relationError } = await supabase
        .from('playlist_songs')
        .delete()
        .eq('song_id', songId)
        .eq('playlist_id', playlistId);

      if (relationError) {
        console.error('Error removing song from playlist:', relationError);
        throw relationError;
      }

      await fetchPlaylists();
    } catch (err) {
      console.error('Error in removeSongFromPlaylist:', err);
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
    deletePlaylist,
    deleteSong,
    removeSongFromPlaylist,
    hideItem,
    refreshPlaylists: fetchPlaylists,
    isGuest
  };
};