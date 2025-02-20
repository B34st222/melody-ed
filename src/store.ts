import { create } from 'zustand';
import { Song, Playlist } from './types';

interface PlayerState {
  currentSong: Song | null;
  currentPlaylist: Playlist | null;
  isPlaying: boolean;
  volume: number;
  progress: number;
  duration: number;
  audioContext: AudioContext | null;
  audioElement: HTMLAudioElement | null;
  isLoading: boolean;
  hasError: boolean;
  setCurrentSong: (song: Song | null, playlist?: Playlist | null) => Promise<void>;
  setIsPlaying: (isPlaying: boolean) => void;
  setVolume: (volume: number) => void;
  setProgress: (progress: number) => void;
  setDuration: (duration: number) => void;
  initializeAudio: () => void;
  playPause: () => void;
  seek: (time: number) => void;
  cleanup: () => void;
  playNextSong: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => {
  let cleanupFunctions: Array<() => void> = [];

  return {
    currentSong: null,
    currentPlaylist: null,
    isPlaying: false,
    volume: 0.5,
    progress: 0,
    duration: 0,
    audioContext: null,
    audioElement: null,
    isLoading: false,
    hasError: false,

    setCurrentSong: async (song, playlist = null) => {
      const state = get();
      
      if (state.isLoading) return;
      
      set({ isLoading: true, hasError: false });
      
      try {
        if (state.audioElement) {
          state.audioElement.pause();
          state.audioElement.currentTime = 0;
        }
        
        set({ currentSong: song, currentPlaylist: playlist, isPlaying: false });
        
        if (song && state.audioElement) {
          state.audioElement.src = song.audio_url;
          await state.audioElement.load();
        }
      } catch (error) {
        console.error('Error setting current song:', error);
        set({ hasError: true });
      } finally {
        set({ isLoading: false });
      }
    },

    setIsPlaying: (isPlaying) => set({ isPlaying }),
    
    setVolume: (volume) => {
      const state = get();
      if (state.audioElement) {
        state.audioElement.volume = volume;
      }
      set({ volume });
    },
    
    setProgress: (progress) => set({ progress }),
    setDuration: (duration) => set({ duration }),

    playNextSong: () => {
      const state = get();
      if (!state.currentPlaylist?.songs || !state.currentSong) return;

      const currentIndex = state.currentPlaylist.songs.findIndex(
        song => song.id === state.currentSong?.id
      );

      if (currentIndex === -1) return;

      const nextSong = state.currentPlaylist.songs[currentIndex + 1];
      if (nextSong) {
        state.setCurrentSong(nextSong, state.currentPlaylist).then(() => {
          if (!state.hasError) {
            state.playPause();
          }
        });
      }
    },

    initializeAudio: () => {
      const state = get();
      
      // Clean up existing audio if it exists
      if (cleanupFunctions.length > 0) {
        cleanupFunctions.forEach(cleanup => cleanup());
        cleanupFunctions = [];
      }

      const audioElement = new Audio();
      audioElement.preload = 'auto';
      
      // Add event listeners
      const timeUpdateHandler = () => {
        set({ progress: audioElement.currentTime });
      };
      
      const loadedMetadataHandler = () => {
        set({ duration: audioElement.duration });
      };
      
      const endedHandler = () => {
        const state = get();
        state.playNextSong();
      };
      
      const errorHandler = () => {
        set({ hasError: true, isPlaying: false, isLoading: false });
      };

      audioElement.addEventListener('timeupdate', timeUpdateHandler);
      audioElement.addEventListener('loadedmetadata', loadedMetadataHandler);
      audioElement.addEventListener('ended', endedHandler);
      audioElement.addEventListener('error', errorHandler);
      
      audioElement.volume = state.volume;
      
      // Store cleanup functions
      cleanupFunctions.push(() => {
        audioElement.removeEventListener('timeupdate', timeUpdateHandler);
        audioElement.removeEventListener('loadedmetadata', loadedMetadataHandler);
        audioElement.removeEventListener('ended', endedHandler);
        audioElement.removeEventListener('error', errorHandler);
        audioElement.pause();
        audioElement.src = '';
        audioElement.load();
      });
      
      set({ 
        audioElement,
        audioContext: null,
        hasError: false
      });
    },

    playPause: async () => {
      const state = get();
      if (!state.audioElement || !state.currentSong || state.isLoading || state.hasError) return;

      try {
        if (state.isPlaying) {
          state.audioElement.pause();
          set({ isPlaying: false });
        } else {
          set({ isLoading: true });
          await state.audioElement.play();
          set({ isPlaying: true });
        }
      } catch (error) {
        console.error('Playback error:', error);
        set({ hasError: true, isPlaying: false });
      } finally {
        set({ isLoading: false });
      }
    },

    seek: (time) => {
      const state = get();
      if (state.audioElement && !state.isLoading && !state.hasError) {
        state.audioElement.currentTime = time;
        set({ progress: time });
      }
    },

    cleanup: () => {
      // Execute all cleanup functions
      cleanupFunctions.forEach(cleanup => cleanup());
      cleanupFunctions = [];
      
      set({
        audioElement: null,
        audioContext: null,
        isPlaying: false,
        progress: 0,
        duration: 0,
        isLoading: false,
        hasError: false
      });
    }
  };
});