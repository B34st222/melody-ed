import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Player from './components/Player';
import PlaylistGrid from './components/PlaylistGrid';
import CreatePlaylistModal from './components/CreatePlaylistModal';
import AuthPage from './components/AuthPage';
import { usePlayerStore } from './store';
import { useSupabase } from './hooks/useSupabase';
import { useAuth } from './hooks/useAuth';
import { Plus } from 'lucide-react';
import { Playlist } from './types';

function MainApp() {
  const { playlists, loading, error, addSong, createPlaylist, deletePlaylist, deleteSong, removeSongFromPlaylist, hideItem, isGuest } = useSupabase();
  const { user } = useAuth();
  const setCurrentSong = usePlayerStore(state => state.setCurrentSong);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handlePlaylistClick = (playlist: Playlist) => {
    if (playlist.songs?.length > 0) {
      setCurrentSong(playlist.songs[0], playlist);
    }
  };

  const handleCreatePlaylistClick = () => {
    if (isGuest) {
      alert('Guest users cannot create playlists. Please sign up for a full account to access this feature.');
      return;
    }
    setIsCreateModalOpen(true);
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-purple-950">
      <Sidebar playlists={playlists} />
      
      <main className="flex-1 overflow-auto p-4 md:p-8 pb-32">
        <header className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">
                Welcome{isGuest ? ' Guest' : user?.email ? `, ${user.email}` : ''}!
              </h1>
              <p className="text-gray-300">Making learning fun through music</p>
              {isGuest && (
                <p className="text-yellow-400 text-sm mt-2">
                  Note: Guest access is limited to viewing and playing system playlists.
                  Sign up for a full account to create your own playlists and add songs!
                </p>
              )}
            </div>
            <button
              onClick={handleCreatePlaylistClick}
              className="sm:ml-auto flex items-center gap-2 bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isGuest}
            >
              <Plus size={20} />
              <span>Create Playlist</span>
            </button>
          </div>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-purple-800/30 rounded-lg aspect-[4/5]"></div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500 text-red-400 p-4 rounded-lg">
            Error: {error}
          </div>
        ) : (
          <section>
            <h2 className="text-xl md:text-2xl font-semibold text-white mb-4 md:mb-6">Featured Playlists</h2>
            <PlaylistGrid 
              playlists={playlists}
              onPlaylistClick={handlePlaylistClick}
              onAddSong={addSong}
              onDeletePlaylist={deletePlaylist}
              onDeleteSong={deleteSong}
              onRemoveSong={removeSongFromPlaylist}
              onHide={hideItem}
            />
          </section>
        )}
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

function App() {
  const { user } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={user ? <Navigate to="/" /> : <AuthPage onAuthSuccess={() => {}} />} />
        <Route path="/" element={user ? <MainApp /> : <Navigate to="/auth" />} />
      </Routes>
    </Router>
  );
}

export default App;