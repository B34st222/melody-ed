import React, { useState } from 'react';
import { Music, Play, Pause, Plus, Trash2, EyeOff } from 'lucide-react';
import { Playlist, Song } from '../types';
import { usePlayerStore } from '../store';
import AddSongModal from './AddSongModal';
import PlaylistSongsModal from './PlaylistSongsModal';
import { useAuth } from '../hooks/useAuth';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
  onAddSong: (playlistId: string, song: Omit<Song, 'id' | 'user_id' | 'created_at'>) => void;
  onDelete?: (playlistId: string) => Promise<void>;
  onRemoveSong?: (songId: string, playlistId: string) => Promise<void>;
  onHide?: (itemId: string, itemType: 'playlist' | 'song') => Promise<void>;
}

const PlaylistCard = ({ playlist, onClick, onAddSong, onDelete, onRemoveSong, onHide }: PlaylistCardProps) => {
  const { currentSong, isPlaying, setCurrentSong, playPause } = usePlayerStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSongsModalOpen, setIsSongsModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHiding, setIsHiding] = useState(false);
  const { user, isGuest } = useAuth();

  const isCurrentPlaylist = currentSong && playlist.songs?.some(song => song.id === currentSong.id);
  const canModify = !isGuest && user?.id === playlist.user_id;
  const isSystemPlaylist = playlist.user_id === '00000000-0000-0000-0000-000000000000';

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isCurrentPlaylist) {
      playPause();
    } else if (playlist.songs?.length > 0) {
      setCurrentSong(playlist.songs[0], playlist).then(() => {
        playPause();
      });
    }
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAddModalOpen(true);
  };

  const handleDeleteClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDelete || isDeleting) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete "${playlist.name}"? This action cannot be undone.`);
    if (!confirmDelete) return;

    setIsDeleting(true);
    try {
      await onDelete(playlist.id);
    } catch (error) {
      console.error('Error deleting playlist:', error);
      alert('Failed to delete playlist. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleHideClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onHide || isHiding || !isSystemPlaylist) return;

    const confirmHide = window.confirm(`Are you sure you want to hide "${playlist.name}"? You can unhide it later from your settings.`);
    if (!confirmHide) return;

    setIsHiding(true);
    try {
      await onHide(playlist.id, 'playlist');
    } catch (error) {
      console.error('Error hiding playlist:', error);
      alert('Failed to hide playlist. Please try again.');
    } finally {
      setIsHiding(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    onClick();
    
    setTimeout(() => {
      setIsTransitioning(false);
      setIsSongsModalOpen(true);
    }, 500);
  };

  return (
    <>
      <div 
        className="bg-purple-800 p-4 rounded-lg cursor-pointer group relative hover:bg-purple-700 transition-colors"
        onClick={handleCardClick}
      >
        <div className="relative">
          <div className="aspect-square w-full h-48 max-h-48 overflow-hidden rounded-md mb-4">
            <img 
              src={playlist.cover_url} 
              alt={playlist.name}
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="absolute bottom-6 right-2 bg-purple-900/80 px-2 py-1 rounded-full flex items-center gap-1">
            <Music size={14} className="text-yellow-400" />
            <span className="text-white text-sm">{playlist.songs?.length || 0}</span>
          </div>
        </div>
        <h3 className="font-semibold text-white mb-1 truncate">{playlist.name}</h3>
        <p className="text-sm text-gray-300 mb-2 line-clamp-2">{playlist.description}</p>
        <p className="text-xs text-gray-400">By {playlist.created_by}</p>
        
        <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
          {isSystemPlaylist && !isGuest && (
            <button 
              className="p-3 bg-purple-600/20 text-purple-300 rounded-full hover:bg-purple-600/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleHideClick}
              disabled={isHiding}
              title="Hide playlist"
            >
              <EyeOff size={24} />
            </button>
          )}
          {canModify && onDelete && (
            <button 
              className="p-3 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleDeleteClick}
              disabled={isDeleting}
              title="Delete playlist"
            >
              <Trash2 size={24} />
            </button>
          )}
          {canModify && (
            <button 
              className="p-3 bg-purple-600 rounded-full hover:bg-purple-500 transition-colors"
              onClick={handleAddClick}
              title="Add song"
            >
              <Plus size={24} />
            </button>
          )}
          <button 
            className="p-3 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-colors"
            onClick={handlePlayClick}
            title={isCurrentPlaylist && isPlaying ? "Pause" : "Play"}
          >
            {isCurrentPlaylist && isPlaying ? (
              <Pause size={24} />
            ) : (
              <Play size={24} />
            )}
          </button>
        </div>
      </div>

      <AddSongModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSong={(song) => onAddSong(playlist.id, song)}
        playlistCategory={playlist.category}
      />

      <PlaylistSongsModal
        isOpen={isSongsModalOpen}
        onClose={() => setIsSongsModalOpen(false)}
        playlist={playlist}
        onDeleteSong={canModify ? (songId) => onDelete?.(songId) : undefined}
        onRemoveSong={canModify ? onRemoveSong : undefined}
        onHide={!isGuest ? onHide : undefined}
      />
    </>
  );
};

export default PlaylistCard;