# Music Practice Helper

A web application for tracking music practice sessions, built with React frontend and Express.js backend. Displays sheet music pages with measures and integrates with a SQLite database containing song metadata, page layouts, and practice session history.

## Features

- **Multi-User Support**: User dropdown to filter and track practice data independently for different practitioners (Ryan, Cliff)
- **Hands Filtering**: Hands dropdown (Both/Right/Left) to filter practice data by hand positions with multi-hands support
- **Smart Multi-Record Indicators**: Intelligent emoji system showing 👥 for multiple practitioners, 🙌 for multiple hands, 👥🙌 for both
- **Color-Coded Multiple Records**: Purple for multiple practitioners, cornflower blue for multiple hands, blended color for both
- **Song Selection**: Browse and select from songs in your practice database
- **Dynamic Page Display**: View actual page/measure layouts from your sheet music database
- **Real-time Data**: Connects to your existing music practice tracking system
- **Köln Concert Integration**: Auto-loads Keith Jarrett's Köln Concert data when available
- **Book Filtering**: Filter songs by music book for organized navigation
- **Confidence Visualization**: See practice progress with color-coded measures and corner confidence display
- **BPM Tracking**: Optional tempo tracking for each measure with historical preservation
- **Interactive Practice Tracking**: Click any measure to open an editable form for confidence levels, notes, BPM, practitioner, and hands info
- **Expandable History**: View complete audit trail of confidence changes with timestamps and filtering
- **Unified Editing Experience**: Same intuitive popup form for all measures - existing data is pre-populated for easy editing
- **Smart Defaults**: New measures automatically default to selected user and hands
- **Global Measure Selection**: "Select Measures" checkbox in sticky header enables multi-measure selection across all pages
- **Bulk Editing**: Edit multiple selected measures simultaneously with shared confidence levels, notes, and BPM
- **Smart Selection Styling**: White borders for colored measures, blue borders for empty measures, with dark outlines for visibility
- **Sticky Header Controls**: Selection controls stay accessible in fixed header during scroll

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
- **song_measure**: Individual measure confidence levels, practice notes, BPM, practicer, and hands tracking
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

### **Multi-Measure Selection & Bulk Editing**
- **Enable Selection Mode**: Check "Select Measures" in the sticky header to activate selection mode
- **Global Selection**: Selection works across all pages - scroll between pages while maintaining selections
- **Visual Selection**: Selected measures show white borders (colored measures) or blue borders (empty measures) with dark outlines
- **Bulk Operations**: Use "Edit Selected" to apply changes to multiple measures at once, or "Clear" to deselect all
- **Sticky Controls**: Selection controls remain accessible in the fixed header during scroll for easy access

## API Endpoints

- `GET /api/books` - List all music books
- `GET /api/songs` - List all songs
- `GET /api/songs/:id` - Get song details
- `GET /api/songs/:id/pages` - Get page/measure layout for a song
- `GET /api/songs/:id/measures` - Get measure confidence data for a song (optional ?practicer= and ?hands= filters)
- `GET /api/songs/:id/measures/:page/:line/:measure/history` - Get historical changes for a specific measure (optional ?practicer= and ?hands= filters)
- `POST /api/songs/:id/measures` - Create or update measure confidence record (with BPM, hands tracking, and history preservation)
- `GET /api/songs/:id/practice-sessions` - Get practice sessions for a song
- `POST /api/practice-sessions` - Create new practice session
