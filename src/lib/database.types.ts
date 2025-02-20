export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      playlists: {
        Row: {
          id: string
          name: string
          description: string | null
          cover_url: string | null
          category: string | null
          created_by: string | null
          user_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          cover_url?: string | null
          category?: string | null
          created_by?: string | null
          user_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          cover_url?: string | null
          category?: string | null
          created_by?: string | null
          user_id?: string | null
          created_at?: string | null
        }
      }
      songs: {
        Row: {
          id: string
          title: string
          artist: string
          cover_url: string | null
          audio_url: string
          category: string | null
          age_range: string | null
          user_id: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          title: string
          artist: string
          cover_url?: string | null
          audio_url: string
          category?: string | null
          age_range?: string | null
          user_id?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          artist?: string
          cover_url?: string | null
          audio_url?: string
          category?: string | null
          age_range?: string | null
          user_id?: string | null
          created_at?: string | null
        }
      }
      playlist_songs: {
        Row: {
          id: string
          playlist_id: string
          song_id: string
          position: number
          created_at: string | null
        }
        Insert: {
          id?: string
          playlist_id: string
          song_id: string
          position: number
          created_at?: string | null
        }
        Update: {
          id?: string
          playlist_id?: string
          song_id?: string
          position?: number
          created_at?: string | null
        }
      }
    }
  }
}