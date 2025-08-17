# Music Practice Helper

A web application for tracking music practice sessions, built with React frontend and Express.js backend. Displays sheet music pages with measures and integrates with a SQLite database containing song metadata, page layouts, and practice session history.

## Features

- **Song Selection**: Browse and select from songs in your practice database
- **Dynamic Page Display**: View actual page/measure layouts from your sheet music database
- **Real-time Data**: Connects to your existing music practice tracking system
- **Köln Concert Integration**: Auto-loads Keith Jarrett's Köln Concert data when available

## Architecture

- **Frontend**: React + Vite development server
- **Backend**: Express.js API server with SQLite database connection
- **Database**: SQLite database with songs, page layouts, and practice sessions

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- NPM

### Installation

1. **Install frontend dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   cd ..
   ```

### Running the Application

1. **Start the backend API server:**
   ```bash
   cd backend
   npm start
   ```
   Backend runs on http://localhost:3001

2. **Start the frontend development server:**
   ```bash
   npm run dev
   ```
   Frontend runs on http://localhost:5173

3. **Open your browser** to http://localhost:5173

## Database Integration

The app connects to `../../../sqlite_mcp_server.db` which contains:
- **songs**: Song metadata (title, artist, year, URLs)
- **song_page_lines**: Page and measure layout data
- **practice_session**: Practice tracking history (future feature)

## Development

- **Frontend Dev**: `npm run dev` (with hot reload)
- **Backend Dev**: `npm run dev` (with auto-restart)
- **Build**: `npm run build`
- **Lint**: `npm run lint`

## API Endpoints

- `GET /api/songs` - List all songs
- `GET /api/songs/:id` - Get song details
- `GET /api/songs/:id/pages` - Get page/measure layout for a song
