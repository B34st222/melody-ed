import React from 'react';
import { X, Play, Pause, Music } from 'lucide-react';
import { Song, Playlist } from '../types';
import { usePlayerStore } from '../store';
import Modal from './Modal';

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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="All Songs"
      icon={<Music size={28} className="text-yellow-400" />}
      maxWidth="2xl"
    >
      <div className="p-6">
        <p className="text-gray-300 mb-4">{allSongs.length} songs available</p>
        <div className="space-y-2">
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
    </Modal>
  );
};

export default AllSongsModal;