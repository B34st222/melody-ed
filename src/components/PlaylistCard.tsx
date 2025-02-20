import React, { useState } from 'react';
import { Play, Pause, Music, Plus } from 'lucide-react';
import { Playlist, Song } from '../types';
import { usePlayerStore } from '../store';
import AddSongModal from './AddSongModal';
import PlaylistSongsModal from './PlaylistSongsModal';

interface PlaylistCardProps {
  playlist: Playlist;
  onClick: () => void;
  onAddSong: (playlistId: string, song: Omit<Song, 'id' | 'user_id' | 'created_at'>) => void;
}

const PlaylistCard = ({ playlist, onClick, onAddSong }: PlaylistCardProps) => {
  const { currentSong, isPlaying, setCurrentSong, playPause } = usePlayerStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSongsModalOpen, setIsSongsModalOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const isCurrentPlaylist = currentSong && playlist.songs?.some(song => song.id === currentSong.id);

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
          <button 
            className="p-3 bg-purple-600 rounded-full hover:bg-purple-500 transition-colors"
            onClick={handleAddClick}
          >
            <Plus size={24} />
          </button>
          <button 
            className="p-3 bg-yellow-400 rounded-full hover:bg-yellow-500 transition-colors"
            onClick={handlePlayClick}
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
      />
    </>
  );
};

export default PlaylistCard;