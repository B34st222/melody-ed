import React from 'react';
import { X, Play, Pause, Music } from 'lucide-react';
import { Song, Playlist } from '../types';
import { usePlayerStore } from '../store';

interface AllSongsModalProps {
  isOpen: boolean;
  onClose: () => void;
  playlists: Playlist[];
}

const AllSongsModal = ({ isOpen, onClose, playlists }: AllSongsModalProps) => {
  const { currentSong, isPlaying, setCurrentSong, playPause } = usePlayerStore();

  // Flatten all songs from all playlists and add playlist info
  const allSongs = playlists.flatMap(playlist => 
    (playlist.songs || []).map(song => ({
      ...song,
      playlistName: playlist.name,
      playlist: playlist
    }))
  );

  const handlePlaySong = (song: Song, playlist: Playlist) => {
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
      <div className="bg-purple-900 p-6 rounded-lg w-full max-w-4xl max-h-[90vh] relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-3 mb-6">
          <Music size={28} className="text-yellow-400" />
          <div>
            <h2 className="text-2xl font-bold text-white">All Songs</h2>
            <p className="text-gray-300">{allSongs.length} songs available</p>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 gap-3">
            {allSongs.map((song) => (
              <div
                key={song.id}
                className="flex items-center gap-4 p-4 bg-purple-800/50 hover:bg-purple-800 rounded-lg cursor-pointer group transition-colors"
                onClick={() => handlePlaySong(song, song.playlist)}
              >
                <div className="w-16 h-16 flex-shrink-0 relative rounded overflow-hidden">
                  <img
                    src={song.cover_url}
                    alt={song.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {currentSong?.id === song.id && isPlaying ? (
                      <Pause size={24} className="text-white" />
                    ) : (
                      <Play size={24} className="text-white" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-medium text-lg truncate">{song.title}</h3>
                  <p className="text-gray-400 truncate">{song.artist}</p>
                  <p className="text-yellow-400/80 text-sm mt-1">From: {song.playlistName}</p>
                </div>
                
                <div className="text-right text-sm text-gray-400">
                  <div className="mb-1">Age {song.age_range}</div>
                  <div className="px-3 py-1 bg-purple-700 rounded-full">{song.category}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllSongsModal;