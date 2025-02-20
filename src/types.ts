export interface Song {
  id: string;
  title: string;
  artist: string;
  cover_url: string;
  audio_url: string;
  category: string;
  age_range: string;
  user_id?: string;
  created_at?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  cover_url: string;
  category: string;
  created_by: string;
  user_id?: string;
  created_at?: string;
  songs?: Song[];
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  position: number;
  created_at?: string;
}