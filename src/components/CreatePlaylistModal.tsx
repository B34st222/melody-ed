import React, { useState } from 'react';
import { Music, X } from 'lucide-react';
import { Playlist } from '../types';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlaylist: (playlist: Omit<Playlist, 'id' | 'user_id' | 'created_at' | 'songs'>) => void;
}

const CreatePlaylistModal = ({ isOpen, onClose, onCreatePlaylist }: CreatePlaylistModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800', // Default cover
    category: '',
    created_by: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreatePlaylist({
      ...formData,
      // Use empty string if description is empty
      description: formData.description.trim() || 'No description provided',
      // Use default cover if none provided
      cover_url: formData.cover_url.trim() || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800'
    });
    setFormData({
      name: '',
      description: '',
      cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
      category: '',
      created_by: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-purple-900 p-6 rounded-lg w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white"
        >
          <X size={24} />
        </button>
        
        <div className="flex items-center gap-2 mb-6">
          <Music className="text-yellow-400" size={24} />
          <h2 className="text-2xl font-bold text-white">Create New Playlist</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-purple-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter playlist name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Description <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-purple-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 resize-none h-24"
              placeholder="Enter playlist description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Cover Image URL <span className="text-gray-400">(optional)</span>
            </label>
            <input
              type="url"
              value={formData.cover_url}
              onChange={(e) => setFormData({ ...formData, cover_url: e.target.value })}
              className="w-full px-3 py-2 bg-purple-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter cover image URL"
            />
            <p className="text-xs text-gray-400 mt-1">Default cover will be used if left empty</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Category <span className="text-red-400">*</span>
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 bg-purple-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            >
              <option value="">Select a category</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="Language Arts">Language Arts</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="Art">Art</option>
              <option value="Music">Music</option>
              <option value="Physical Education">Physical Education</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Created By <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.created_by}
              onChange={(e) => setFormData({ ...formData, created_by: e.target.value })}
              className="w-full px-3 py-2 bg-purple-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              placeholder="Enter creator name"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-400 text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition-colors mt-6"
          >
            Create Playlist
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreatePlaylistModal;