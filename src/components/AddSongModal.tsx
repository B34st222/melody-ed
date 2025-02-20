import React, { useState, useRef } from 'react';
import { X, Music, Upload } from 'lucide-react';
import { Song } from '../types';

interface AddSongModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSong: (song: Omit<Song, 'id' | 'user_id' | 'created_at'>) => void;
  playlistCategory: string;
}

const AddSongModal = ({ isOpen, onClose, onAddSong, playlistCategory }: AddSongModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
    audio_url: '',
    age_range: '',
  });

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'audio/mpeg') {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioPreviewUrl(url);
      setFormData(prev => ({
        ...prev,
        audio_url: url
      }));
    } else {
      alert('Please select a valid MP3 file');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onAddSong({
        ...formData,
        category: playlistCategory,
        cover_url: formData.cover_url.trim() || 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800'
      });

      // Reset form
      setFormData({
        title: '',
        artist: '',
        cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
        audio_url: '',
        age_range: '',
      });
      setAudioFile(null);
      setAudioPreviewUrl('');
      onClose();
    } catch (error) {
      console.error('Error adding song:', error);
      alert('Failed to add song. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (audioPreviewUrl) {
      URL.revokeObjectURL(audioPreviewUrl);
    }
    setFormData({
      title: '',
      artist: '',
      cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800',
      audio_url: '',
      age_range: '',
    });
    setAudioFile(null);
    setAudioPreviewUrl('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
      <div className="bg-purple-900 rounded-lg w-full max-w-md relative">
        {/* Header */}
        <div className="sticky top-0 bg-purple-900 p-6 rounded-t-lg border-b border-purple-800">
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-2">
            <Music className="text-yellow-400" size={24} />
            <h2 className="text-2xl font-bold text-white">Add New Song</h2>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 bg-purple-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter song title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Artist <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.artist}
                onChange={(e) => setFormData({ ...formData, artist: e.target.value })}
                className="w-full px-3 py-2 bg-purple-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder="Enter artist name"
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
                Audio File <span className="text-red-400">*</span>
              </label>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/mpeg"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-purple-800 rounded-md text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors"
                >
                  <Upload size={18} />
                  {audioFile ? audioFile.name : 'Choose MP3 File'}
                </button>
                {audioPreviewUrl && (
                  <div className="bg-purple-800/50 p-3 rounded-md">
                    <audio controls className="w-full">
                      <source src={audioPreviewUrl} type="audio/mpeg" />
                      Your browser does not support the audio element.
                    </audio>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Age Range <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={formData.age_range}
                onChange={(e) => setFormData({ ...formData, age_range: e.target.value })}
                className="w-full px-3 py-2 bg-purple-800 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              >
                <option value="">Select age range</option>
                <option value="5-8">5-8 years</option>
                <option value="6-9">6-9 years</option>
                <option value="7-10">7-10 years</option>
                <option value="8-11">8-11 years</option>
                <option value="9-12">9-12 years</option>
                <option value="10-13">10-13 years</option>
              </select>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-purple-900 p-6 rounded-b-lg border-t border-purple-800">
          <button
            type="submit"
            form="add-song-form"
            disabled={!audioFile || isLoading}
            className="w-full bg-yellow-400 text-black font-semibold py-2 rounded-md hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></span>
                <span>Adding Song...</span>
              </>
            ) : (
              'Add Song'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSongModal;