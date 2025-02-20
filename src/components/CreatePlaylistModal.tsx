import React, { useState } from 'react';
import { Music } from 'lucide-react';
import { Playlist } from '../types';
import Modal from './Modal';

interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreatePlaylist: (playlist: Omit<Playlist, 'id' | 'user_id' | 'created_at' | 'songs'>) => void;
}

const CreatePlaylistModal = ({ isOpen, onClose, onCreatePlaylist }: CreatePlaylistModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
    category: '',
    created_by: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreatePlaylist({
      ...formData,
      description: formData.description.trim() || 'No description provided',
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Playlist"
      icon={<Music className="text-yellow-400" size={24} />}
      maxWidth="md"
      footer={
        <button
          type="submit"
          form="create-playlist-form"
          className="w-full bg-yellow-400 text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition-colors"
        >
          Create Playlist
        </button>
      }
    >
      <div className="p-6">
        <form id="create-playlist-form" onSubmit={handleSubmit} className="space-y-4">
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
        </form>
      </div>
    </Modal>
  );
};

export default CreatePlaylistModal;