import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import Carousel from './components/Carousel';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import AuthPage from './components/AuthPage';
import { usePlayerStore } from './store';
import { useSupabase } from './hooks/useSupabase';
import { useAuth } from './hooks/useAuth';
import { Plus } from 'lucide-react';
import { Playlist } from './types';

const SUBJECTS = [
  'Mathematics',
  'Science',
  'Language Arts',
  'History',
  'Geography',
  'Art',
  'Music',
  'Physical Education'
];

function App() {
  const { playlists, loading, error, addSong, createPlaylist } = useSupabase();
  const { user, loading: authLoading } = useAuth();
  const setCurrentSong = usePlayerStore(state => state.setCurrentSong);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handlePlaylistClick = (playlist: Playlist) => {
    if (playlist.songs?.length > 0) {
      setCurrentSong(playlist.songs[0], playlist);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-purple-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-400 border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={() => {}} />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-purple-950">
      <Sidebar playlists={playlists} />
      
      <main className="flex-1 overflow-auto p-4 md:p-8 pb-32">
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Welcome!</h1>
              <p className="text-gray-300">Making learning fun through music</p>
            </div>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="sm:ml-auto flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors"
            >
              <Plus size={20} />
              <span>Create Playlist</span>
            </button>
          </div>
        </header>

        {loading ? (
          <div className="text-white">Loading playlists...</div>
        ) : error ? (
          <div className="text-red-400">Error: {error}</div>
        ) : (
          <section className="mb-8 md:mb-12">
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6">Featured Playlists</h2>
            <Carousel 
              playlists={playlists}
              onPlaylistClick={handlePlaylistClick}
              onAddSong={addSong}
            />
          </section>
        )}

        <section>
          <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6">Popular Subjects</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
            {SUBJECTS.map((subject) => (
              <div 
                key={subject}
                className="bg-purple-800 p-4 md:p-6 rounded-lg text-center cursor-pointer hover:bg-purple-700 transition-colors group"
              >
                <h3 className="text-sm md:text-base text-white font-medium group-hover:text-yellow-400 transition-colors">{subject}</h3>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Player />

      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreatePlaylist={createPlaylist}
      />
    </div>
  );
}

export default App;