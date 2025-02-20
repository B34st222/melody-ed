import React from 'react';
import { Playlist, Song } from '../types';
import PlaylistCard from './PlaylistCard';

interface PlaylistGridProps {
  playlists: Playlist[];
  onPlaylistClick: (playlist: Playlist) => void;
  onAddSong: (playlistId: string, song: Omit<Song, 'id' | 'user_id' | 'created_at'>) => void;
  onDeletePlaylist?: (playlistId: string) => Promise<void>;
  onDeleteSong?: (songId: string, playlistId: string) => Promise<void>;
  onRemoveSong?: (songId: string, playlistId: string) => Promise<void>;
  onHide?: (itemId: string, itemType: 'playlist' | 'song') => Promise<void>;
}

const PlaylistGrid: React.FC<PlaylistGridProps> = ({ 
  playlists, 
  onPlaylistClick, 
  onAddSong,
  onDeletePlaylist,
  onDeleteSong,
  onRemoveSong,
  onHide
}) => {
  if (playlists.length === 0) {
    return (
      <div className="bg-purple-800/30 rounded-lg p-8 text-center">
        <p className="text-gray-300">No playlists available yet.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {playlists.map((playlist) => (
        <PlaylistCard
          key={playlist.id}
          playlist={playlist}
          onClick={() => onPlaylistClick(playlist)}
          onAddSong={onAddSong}
          onDelete={onDeletePlaylist ? 
            (playlistId) => onDeletePlaylist(playlistId) : 
            undefined
          }
          onRemoveSong={onRemoveSong}
          onHide={onHide}
        />
      ))}
    </div>
  );
};

export default PlaylistGrid;