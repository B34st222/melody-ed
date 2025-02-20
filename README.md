# MelodyEd

An educational music platform that makes learning fun through interactive playlists and songs.

## Features

- User authentication with email/password and guest access
- Create and manage educational playlists
- Add songs with metadata (title, artist, age range, etc.)
- Audio player with playlist support
- Responsive design for all devices
- Beautiful UI with dark theme

## Tech Stack

- React
- TypeScript
- Tailwind CSS
- Supabase (Auth & Database)
- Vite
- Zustand (State Management)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/melody-ed.git
   cd melody-ed
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Database Setup

The project uses Supabase as the backend. The database schema includes:

- `playlists` - Stores playlist information
- `songs` - Stores song metadata
- `playlist_songs` - Junction table for playlist-song relationships

All tables have Row Level Security (RLS) policies configured for proper data access control.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.