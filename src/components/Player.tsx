import React, { useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Loader2, AlertCircle } from 'lucide-react';
import { usePlayerStore } from '../store';

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const Player = () => {
  const { 
    currentSong, 
    isPlaying,
    isLoading,
    hasError,
    volume, 
    progress,
    duration,
    setVolume,
    initializeAudio,
    playPause,
    seek,
    cleanup
  } = usePlayerStore();

  useEffect(() => {
    initializeAudio();
    return () => {
      cleanup();
    };
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-purple-800 text-white p-4 z-50">
      <div className="max-w-7xl mx-auto">
        <div className="w-full mb-2 md:mb-4 flex items-center gap-2">
          <span className="text-xs md:text-sm">{formatTime(progress)}</span>
          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max={duration || 100}
              value={progress}
              onChange={(e) => seek(parseFloat(e.target.value))}
              className="w-full h-1 bg-purple-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #fbbf24 ${(progress / (duration || 100)) * 100}%, #4c1d95 ${(progress / (duration || 100)) * 100}%)`
              }}
            />
          </div>
          <span className="text-xs md:text-sm">{formatTime(duration)}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
          {currentSong ? (
            <div className="flex items-center gap-4">
              <img 
                src={currentSong.cover_url} 
                alt={currentSong.title} 
                className="w-10 h-10 md:w-12 md:h-12 rounded shadow-lg"
              />
              <div className="min-w-0">
                <h3 className="font-medium text-sm md:text-base truncate">{currentSong.title}</h3>
                <p className="text-xs md:text-sm text-gray-300 truncate">{currentSong.artist}</p>
              </div>
              {hasError && (
                <div className="flex items-center text-red-400 gap-1">
                  <AlertCircle size={16} />
                  <span className="text-xs md:text-sm">Failed to load audio</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-700 rounded animate-pulse" />
              <div>
                <h3 className="font-medium text-sm md:text-base">Select a song</h3>
                <p className="text-xs md:text-sm text-gray-300">-</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-center gap-4">
            <button 
              className="hover:text-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!currentSong || isLoading || hasError}
            >
              <SkipBack size={20} className="md:w-6 md:h-6" />
            </button>
            <button 
              className={`p-2 md:p-3 rounded-full transition-colors ${
                currentSong && !hasError ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gray-600'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
              onClick={playPause}
              disabled={!currentSong || isLoading || hasError}
            >
              {isLoading ? (
                <Loader2 size={20} className="animate-spin md:w-6 md:h-6" />
              ) : isPlaying ? (
                <Pause size={20} className="md:w-6 md:h-6" />
              ) : (
                <Play size={20} className="md:w-6 md:h-6" />
              )}
            </button>
            <button 
              className="hover:text-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!currentSong || isLoading || hasError}
            >
              <SkipForward size={20} className="md:w-6 md:h-6" />
            </button>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Volume2 size={18} />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 h-1 bg-purple-600 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #fbbf24 ${volume * 100}%, #4c1d95 ${volume * 100}%)`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Player