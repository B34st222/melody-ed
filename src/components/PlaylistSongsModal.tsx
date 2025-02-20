import React from 'react';
import { Music, Play, Pause, Trash2, MinusCircle, EyeOff } from 'lucide-react';
import { Song, Playlist } from '../types';
import { usePlayerStore } from '../store';
import Modal from './Modal';

interface PlaylistSongsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist;
  onDeleteSong?: (songId: string) => Promise<void>;
  onRemoveSong?: (songId: string, playlistId: string) => Promise<void>;
  onHide?: (itemId: string, itemType: 'playlist' | 'song') => Promise<void>;
}

const PlaylistSongsModal = ({ isOpen, onClose, playlist, onDeleteSong, onRemoveSong, onHide }: PlaylistSongsModalProps) => {
  const { currentSong, isPlaying, setCurrentSong, playPause } = usePlayerStore();
  const [deletingSongId, setDeletingSongId] = React.useState<string | null>(null);
  const [removingSongId, setRemovingSongId] = React.useState<string | null>(null);
  const [hidingSongId, setHidingSongId] = React.useState<string | null>(null);

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      playPause();
    } else {
      setCurrentSong(song, playlist).then(() => {
        playPause();
      });
    }
  };

  const handleDeleteSong = async (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    if (!onDeleteSong || deletingSongId) return;

    const confirmDelete = window.confirm('Are you sure you want to delete this song? This action cannot be undone.');
    if (!confirmDelete) return;

    setDeletingSongId(songId);
    try {
      await onDeleteSong(songId);
    } catch (error) {
      console.error('Error deleting song:', error);
      alert('Failed to delete song. Please try again.');
    } finally {
      setDeletingSongId(null);
    }
  };

  const handleRemoveSong = async (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    if (!onRemoveSong || removingSongId) return;

    const confirmRemove = window.confirm('Are you sure you want to remove this song from the playlist?');
    if (!confirmRemove) return;

    setRemovingSongId(songId);
    try {
      await onRemoveSong(songId, playlist.id);
    } catch (error) {
      console.error('Error removing song:', error);
      alert('Failed to remove song from playlist. Please try again.');
    } finally {
      setRemovingSongId(null);
    }
  };

  const handleHideSong = async (e: React.MouseEvent, songId: string) => {
    e.stopPropagation();
    if (!onHide || hidingSongId) return;

    const confirmHide = window.confirm('Are you sure you want to hide this song? You can unhide it later from your settings.');
    if (!confirmHide) return;

    setHidingSongId(songId);
    try {
      await onHide(songId, 'song');
    } catch (error) {
      console.error('Error hiding song:', error);
      alert('Failed to hide song. Please try again.');
    } finally {
      setHidingSongId(null);
    }
  };

  const playlistInfo = (
    <div className="p-6 border-b border-purple-800">
      <div className="flex items-start gap-4">
        <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
          <img 
            src={playlist.cover_url} 
            alt={playlist.name}
            className="w-full h-full object-cover" 
          />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">{playlist.name}</h3>
          <p className="text-gray-300 mb-2">{playlist.description}</p>
          <p className="text-sm text-gray-400">Created by {playlist.created_by}</p>
          <div className="flex items-center gap-2 mt-2">
            <Music size={16} className="text-yellow-400" />
            <span className="text-gray-300">{playlist.songs?.length || 0} songs</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Playlist Songs"
      icon={<Music className="text-yellow-400" size={24} />}
      maxWidth="2xl"
    >
      {playlistInfo}
      <div className="p-6">
        <div className="space-y-2">
          {playlist.songs?.map((song) => {
            const isSystemSong = song.user_id === '00000000-0000-0000-0000-000000000000';
            
            return (
              <div
                key={song.id}
                className="flex items-center gap-4 p-3 hover:bg-purple-800 rounded-lg cursor-pointer group"
                onClick={() => handlePlaySong(song)}
              >
                <div className="w-12 h-12 flex-shrink-0 relative rounded overflow-hidden">
                  <img
                    src={song.cover_url}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {currentSong?.id === song.id && isPlaying ? (
                      <Pause size={20} className="text-white" />
                    ) : (
                      <Play size={20} className="text-white" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium truncate">{song.title}</h3>
                  <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div className="text-gray-400">Age {song.age_range}</div>
                    <div className="text-yellow-400/80">{song.category}</div>
                  </div>

                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isSystemSong && onHide && (
                      <button
                        onClick={(e) => handleHideSong(e, song.id)}
                        disabled={hidingSongId === song.id}
                        className="p-2 text-purple-300 hover:text-purple-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Hide song"
                      >
                        <EyeOff size={20} />
                      </button>
                    )}
                    {onRemoveSong && (
                      <button
                        onClick={(e) => handleRemoveSong(e, song.id)}
                        disabled={removingSongId === song.id}
                        className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Remove from playlist"
                      >
                        <MinusCircle size={20} />
                      </button>
                    )}
                    {onDeleteSong && !isSystemSong && (
                      <button
                        onClick={(e) => handleDeleteSong(e, song.id)}
                        disabled={deletingSongId === song.id}
                        className="p-2 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Delete song"
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export default PlaylistSongsModal;