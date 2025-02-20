import React from 'react';
import { X, Play, Pause, Music } from 'lucide-react';
import { Song, Playlist } from '../types';
import { usePlayerStore } from '../store';

interface PlaylistSongsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlist: Playlist;
}

const PlaylistSongsModal = ({ isOpen, onClose, playlist }: PlaylistSongsModalProps) => {
  const { currentSong, isPlaying, setCurrentSong, playPause } = usePlayerStore();

  const handlePlaySong = (song: Song) => {
    if (currentSong?.id === song.id) {
      playPause();
    } else {
      setCurrentSong(song, playlist).then(() => {
        playPause();
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-purple-900 p-6 rounded-lg w-full max-w-2xl max-h-[80vh] relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        
        <div className="flex items-start gap-4 mb-6">
          <div className="w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden">
            <img 
              src={playlist.cover_url} 
              alt={playlist.name}
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">{playlist.name}</h2>
            <p className="text-gray-300 mb-2">{playlist.description}</p>
            <p className="text-sm text-gray-400">Created by {playlist.created_by}</p>
            <div className="flex items-center gap-2 mt-2">
              <Music size={16} className="text-yellow-400" />
              <span className="text-gray-300">{playlist.songs?.length || 0} songs</span>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-200px)]">
          {playlist.songs?.map((song, index) => (
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
              
              <div className="text-right text-sm text-gray-400">
                <div>Age {song.age_range}</div>
                <div>{song.category}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlaylistSongsModal;