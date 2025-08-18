# Music Practice Helper

A web application for tracking music practice sessions, built with React frontend and Express.js backend. Displays sheet music pages with measures and integrates with a SQLite database containing song metadata, page layouts, and practice session history.

## Features

- **Song Selection**: Browse and select from songs in your practice database
- **Dynamic Page Display**: View actual page/measure layouts from your sheet music database
- **Real-time Data**: Connects to your existing music practice tracking system
- **Köln Concert Integration**: Auto-loads Keith Jarrett's Köln Concert data when available
- **Book Filtering**: Filter songs by music book for organized navigation
- **Confidence Visualization**: See practice progress with color-coded measures
- **Detailed Practice Tracking**: Click measures to view confidence levels, notes, and practice history

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
- **songs**: Song metadata (title, artist, year, URLs, book assignments)
- **song_page_lines**: Page and measure layout data  
- **song_measure**: Individual measure confidence levels and practice notes
- **practice_session**: Practice tracking history
- **music_book**: Book metadata for organization

## Development

- **Frontend Dev**: `npm run dev` (with hot reload)
- **Backend Dev**: `npm run dev` (with auto-restart)
- **Build**: `npm run build`
- **Lint**: `npm run lint`

## Confidence Visualization

The app displays practice progress through an intuitive color-coding system:

### **Traffic Light Colors**
- **Red (0-4.9)**: Measures needing practice
- **Yellow (5.0-5.9)**: Measures showing progress  
- **Green (6.0-10.0)**: Confident and mastered measures
- **⭐ Star**: Perfect confidence level (10.0)

### **Interactive Details**
- **Click any colored measure** to view detailed information
- **Popup shows**: Confidence level, practice notes, who practiced, and timestamps
- **Visual feedback**: Pointer cursor indicates clickable measures

## API Endpoints

- `GET /api/books` - List all music books
- `GET /api/songs` - List all songs
- `GET /api/songs/:id` - Get song details
- `GET /api/songs/:id/pages` - Get page/measure layout for a song
- `GET /api/songs/:id/measures` - Get measure confidence data for a song
