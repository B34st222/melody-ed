import React, { useState } from 'react';
import { Home, Music, BookOpen, Users, Star, Library, Menu, X, LogOut } from 'lucide-react';
import AllSongsModal from './AllSongsModal';
import { Playlist } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  playlists: Playlist[];
}

const Sidebar = ({ playlists }: SidebarProps) => {
  const [isSongsModalOpen, setIsSongsModalOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { signOut, isGuest } = useAuth();
  const navigate = useNavigate();

  const handleAuthAction = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error with auth action:', error);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMenu}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-purple-800 rounded-lg text-white hover:bg-purple-700 transition-colors"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed md:sticky top-0 left-0 h-full bg-purple-900 text-white
        ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 z-40 flex flex-col overflow-hidden
      `}>
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Header */}
          <div className="p-6 flex-shrink-0">
            <div className="flex items-center gap-2 mb-8">
              <Music size={32} className="text-yellow-400" />
              <h1 className="text-2xl font-bold">MelodyEd</h1>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-6 space-y-4">
            <a href="#" className="flex items-center gap-3 text-lg hover:text-yellow-400 transition-colors">
              <Home size={20} /> Home
            </a>
            <button 
              onClick={() => {
                setIsSongsModalOpen(true);
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-3 text-lg hover:text-yellow-400 transition-colors w-full text-left"
            >
              <Library size={20} /> Songs
            </button>
            <a href="#" className="flex items-center gap-3 text-lg hover:text-yellow-400 transition-colors">
              <BookOpen size={20} /> Subjects
            </a>
            <a href="#" className="flex items-center gap-3 text-lg hover:text-yellow-400 transition-colors">
              <Users size={20} /> Teachers
            </a>
            <a href="#" className="flex items-center gap-3 text-lg hover:text-yellow-400 transition-colors">
              <Star size={20} /> Favorites
            </a>
            <button
              onClick={handleAuthAction}
              className={`flex items-center gap-3 text-lg w-full text-left transition-colors ${
                isGuest 
                  ? 'text-yellow-400 hover:text-yellow-500' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <LogOut size={20} />
              {isGuest ? 'Sign In' : 'Sign Out'}
            </button>
          </nav>

          {/* Footer */}
          <div className="p-6 mt-auto border-t border-purple-800">
            <p className="text-sm text-gray-400">
              © 2025 MelodyEd
            </p>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <AllSongsModal
        isOpen={isSongsModalOpen}
        onClose={() => setIsSongsModalOpen(false)}
        playlists={playlists}
      />
    </>
  );
};

export default Sidebar;