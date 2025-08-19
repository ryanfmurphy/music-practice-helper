# Music Practice Helper

A web application for tracking music practice sessions, built with React frontend and Express.js backend. Displays sheet music pages with measures and integrates with a SQLite database containing song metadata, page layouts, and practice session history.

## Features

- **Multi-User Support**: User dropdown to filter and track practice data independently for different practitioners (Ryan, Cliff)
- **Song Selection**: Browse and select from songs in your practice database
- **Dynamic Page Display**: View actual page/measure layouts from your sheet music database
- **Real-time Data**: Connects to your existing music practice tracking system
- **Köln Concert Integration**: Auto-loads Keith Jarrett's Köln Concert data when available
- **Book Filtering**: Filter songs by music book for organized navigation
- **Confidence Visualization**: See practice progress with color-coded measures and corner confidence display
- **BPM Tracking**: Optional tempo tracking for each measure with historical preservation
- **Interactive Practice Tracking**: Click any measure to open an editable form for confidence levels, notes, BPM, and practitioner info
- **Expandable History**: View complete audit trail of confidence changes with timestamps
- **Unified Editing Experience**: Same intuitive popup form for all measures - existing data is pre-populated for easy editing
- **Smart Defaults**: New measures automatically default to selected user

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
- **song_measure**: Individual measure confidence levels, practice notes, BPM, and practicer tracking
- **song_measure_history**: Historical versions of measure data with timestamps for complete audit trail
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
- **⭐ Star**: Perfect confidence level (10.0) shown at full opacity in corner

### **Corner Display**
- **Confidence ratings** appear in top right corner of each measure at 50% opacity
- **Star emoji** for perfect 10.0 ratings appears at full opacity for celebration
- **Clean layout** with measure numbers prominently displayed in center

### **Interactive Details**
- **Click any measure** (colored or uncolored) to open editable form popup
- **Multi-user tracking**: Each practitioner can have independent confidence records for the same measure
- **Unified interface**: Same form layout for all measures with consistent editing experience
- **Smart pre-population**: Existing measures automatically fill form fields with current data for easy editing
- **New measure entry**: Form with confidence level (0-10), practitioner name (defaults to selected user), optional BPM, and notes
- **Expandable history**: Click to view complete audit trail of changes with timestamps and BPM data
- **Real-time updates**: Changes immediately appear with correct traffic light colors after saving
- **Visual feedback**: Pointer cursor indicates all measures are clickable and editable

## API Endpoints

- `GET /api/books` - List all music books
- `GET /api/songs` - List all songs
- `GET /api/songs/:id` - Get song details
- `GET /api/songs/:id/pages` - Get page/measure layout for a song
- `GET /api/songs/:id/measures` - Get measure confidence data for a song (optional ?practicer= filter)
- `GET /api/songs/:id/measures/:page/:line/:measure/history` - Get historical changes for a specific measure
- `POST /api/songs/:id/measures` - Create or update measure confidence record (with BPM and history preservation)
- `GET /api/songs/:id/practice-sessions` - Get practice sessions for a song
- `POST /api/practice-sessions` - Create new practice session
