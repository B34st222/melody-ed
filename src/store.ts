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
  let playPromise: Promise<void> | null = null;

  const handlePlaybackError = (error: any) => {
    console.error('Audio playback error:', error?.message || 'Unknown error');
    set({ hasError: true, isPlaying: false, isLoading: false });
  };

  const createAudioElement = () => {
    const audio = new Audio();
    audio.preload = 'metadata';
    return audio;
  };

  const initializeAudioContext = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      return new AudioContext();
    } catch (error) {
      console.warn('AudioContext not supported:', error);
      return null;
    }
  };

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
        // Clean up existing audio
        if (state.audioElement) {
          if (playPromise) {
            await playPromise;
          }
          state.audioElement.pause();
          state.audioElement.src = '';
          state.audioElement.load();
        }

        // Reset state for new song
        set({ 
          currentSong: song, 
          currentPlaylist: playlist, 
          isPlaying: false,
          progress: 0,
          duration: 0,
          hasError: false
        });
        
        if (song) {
          // Create new audio element for each song
          const audio = createAudioElement();
          audio.volume = state.volume;
          
          // Initialize audio context if needed
          if (!state.audioContext) {
            const context = initializeAudioContext();
            if (context) {
              set({ audioContext: context });
            }
          }

          // Set up error handling before loading
          const errorHandler = (e: ErrorEvent) => {
            console.error('Audio load error:', e);
            handlePlaybackError(new Error('Failed to load audio'));
          };

          audio.addEventListener('error', errorHandler);

          // Pre-load the audio
          try {
            await new Promise((resolve, reject) => {
              const loadHandler = () => {
                resolve(true);
                cleanup();
              };
              
              const errorHandler = () => {
                reject(new Error('Failed to load audio'));
                cleanup();
              };

              const cleanup = () => {
                audio.removeEventListener('canplaythrough', loadHandler);
                audio.removeEventListener('error', errorHandler);
              };
              
              audio.addEventListener('canplaythrough', loadHandler);
              audio.addEventListener('error', errorHandler);
              
              // Set source and load
              audio.src = song.audio_url;
              audio.load();
            });

            // Update state with new audio element
            set({ audioElement: audio });
          } catch (error) {
            audio.removeEventListener('error', errorHandler);
            throw error;
          }
        }
      } catch (error) {
        handlePlaybackError(error);
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

      const audioElement = createAudioElement();
      
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
      
      const errorHandler = (e: ErrorEvent) => {
        console.error('Audio error:', e);
        handlePlaybackError(audioElement.error);
      };

      audioElement.addEventListener('timeupdate', timeUpdateHandler);
      audioElement.addEventListener('loadedmetadata', loadedMetadataHandler);
      audioElement.addEventListener('ended', endedHandler);
      audioElement.addEventListener('error', errorHandler);
      
      audioElement.volume = state.volume;
      
      // Store cleanup functions
      cleanupFunctions.push(() => {
        if (playPromise) {
          playPromise.then(() => {
            audioElement.removeEventListener('timeupdate', timeUpdateHandler);
            audioElement.removeEventListener('loadedmetadata', loadedMetadataHandler);
            audioElement.removeEventListener('ended', endedHandler);
            audioElement.removeEventListener('error', errorHandler);
            audioElement.pause();
            audioElement.src = '';
            audioElement.load();
          });
        } else {
          audioElement.removeEventListener('timeupdate', timeUpdateHandler);
          audioElement.removeEventListener('loadedmetadata', loadedMetadataHandler);
          audioElement.removeEventListener('ended', endedHandler);
          audioElement.removeEventListener('error', errorHandler);
          audioElement.pause();
          audioElement.src = '';
          audioElement.load();
        }
      });
      
      set({ 
        audioElement,
        audioContext: initializeAudioContext(),
        hasError: false
      });
    },

    playPause: () => {
      const state = get();
      if (!state.audioElement || !state.currentSong || state.isLoading || state.hasError) return;

      try {
        if (state.isPlaying) {
          if (playPromise) {
            playPromise.then(() => {
              state.audioElement?.pause();
              set({ isPlaying: false });
            });
          } else {
            state.audioElement.pause();
            set({ isPlaying: false });
          }
        } else {
          set({ isLoading: true, hasError: false });

          // Resume audio context if it was suspended
          if (state.audioContext?.state === 'suspended') {
            state.audioContext.resume();
          }
          
          // Play with error handling
          playPromise = state.audioElement.play();
          playPromise
            .then(() => {
              set({ isPlaying: true });
            })
            .catch((error) => {
              if (error.name === 'NotAllowedError') {
                console.warn('Playback requires user interaction first');
                set({ isPlaying: false });
              } else {
                handlePlaybackError(error);
              }
            })
            .finally(() => {
              set({ isLoading: false });
              playPromise = null;
            });
        }
      } catch (error) {
        handlePlaybackError(error);
      }
    },

    seek: (time) => {
      const state = get();
      if (state.audioElement && !state.isLoading && !state.hasError) {
        if (playPromise) {
          playPromise.then(() => {
            if (state.audioElement) {
              state.audioElement.currentTime = time;
              set({ progress: time });
            }
          });
        } else {
          state.audioElement.currentTime = time;
          set({ progress: time });
        }
      }
    },

    cleanup: () => {
      if (playPromise) {
        playPromise.then(() => {
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
        });
      } else {
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
    }
  };
});