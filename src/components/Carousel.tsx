import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Playlist, Song } from '../types';
import PlaylistCard from './PlaylistCard';

interface CarouselProps {
  playlists: Playlist[];
  onPlaylistClick: (playlist: Playlist) => void;
  onAddSong: (playlistId: string, song: Omit<Song, 'id'>) => void;
}

const Carousel: React.FC<CarouselProps> = ({ playlists, onPlaylistClick, onAddSong }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  useEffect(() => {
    const updateItemsPerPage = () => {
      if (window.innerWidth < 640) {
        setItemsPerPage(1);
      } else if (window.innerWidth < 1024) {
        setItemsPerPage(2);
      } else if (window.innerWidth < 1280) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(4);
      }
    };

    updateItemsPerPage();
    window.addEventListener('resize', updateItemsPerPage);
    return () => window.removeEventListener('resize', updateItemsPerPage);
  }, []);

  const totalPages = Math.max(1, Math.ceil(playlists.length / itemsPerPage));

  const nextSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  };

  const prevSlide = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prev) => (prev - 1 + totalPages) % totalPages);
  };

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  const handlePlaylistClick = (playlist: Playlist) => {
    const playlistIndex = playlists.findIndex(p => p.id === playlist.id);
    const targetPage = Math.floor(playlistIndex / itemsPerPage);
    
    if (targetPage !== currentIndex) {
      setIsAnimating(true);
      setCurrentIndex(targetPage);
      
      setTimeout(() => {
        setIsAnimating(false);
        onPlaylistClick(playlist);
      }, 500);
    } else {
      onPlaylistClick(playlist);
    }
  };

  return (
    <div className="relative group">
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {Array.from({ length: totalPages }).map((_, pageIndex) => (
            <div
              key={pageIndex}
              className="flex gap-3 md:gap-6 min-w-full"
            >
              {Array.from({ length: itemsPerPage }).map((_, itemIndex) => {
                const playlist = playlists[pageIndex * itemsPerPage + itemIndex];
                return (
                  <div key={itemIndex} className="flex-1">
                    {playlist ? (
                      <PlaylistCard
                        playlist={playlist}
                        onClick={() => handlePlaylistClick(playlist)}
                        onAddSong={onAddSong}
                      />
                    ) : (
                      <div className="bg-purple-800/30 rounded-lg aspect-[4/5] h-full"></div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 bg-purple-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        disabled={isAnimating}
      >
        <ChevronLeft className="text-white" size={20} />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 bg-purple-800 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400"
        disabled={isAnimating}
      >
        <ChevronRight className="text-white" size={20} />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: totalPages }).map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (!isAnimating) {
                setIsAnimating(true);
                setCurrentIndex(index);
              }
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              currentIndex === index
                ? 'bg-yellow-400 w-4'
                : 'bg-purple-600 hover:bg-purple-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;