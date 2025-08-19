# Music Practice Helper Web Application

## Overview
A fully functional React-based web application for interactive music practice tracking. Provides visualization of sheet music pages with real-time practice progress display.

## Architecture
- **Frontend**: React 18 + Vite development server (localhost:5173)
- **Backend**: Express.js API server with SQLite integration (localhost:3001)
- **Database**: Uses main `sqlite_mcp_server.db` for songs, pages, measures, and practice data

## Key Features
- **Book & Song Navigation**: Dropdown selectors for filtering by music books and songs
- **Dynamic Page Layout**: Displays actual sheet music pages with proper left/right book positioning
- **Confidence Visualization**: Traffic light color system (red → yellow → green) showing practice progress on individual measures
- **Unified Measure Editing**: Click any measure to open the same editable form interface for consistent user experience
- **Smart Form Pre-population**: Existing measures automatically fill form fields, new measures start with empty fields
- **Real-time Updates**: All changes immediately appear with correct color coding without page refresh
- **Real-time Database Integration**: Connects directly to existing practice tracking system with automatic book_id resolution
- **Automatic History Tracking**: All measure updates preserve previous data in `song_measure_history` table for complete audit trail

## Quick Start
```bash
# Backend (from backend/)
npm install && npm start

# Frontend (from root directory)
npm install && npm run dev
```

## Database Tables Used
- `songs` - Song metadata and book assignments
- `song_page_lines` - Page/line layout with measure counts
- `song_measure` - Individual measure confidence levels and practice notes
- `song_measure_history` - Historical versions of measure data with timestamps for audit trail
- `music_book` - Book organization
- `practice_session` - Practice history (future integration)

## Technical Details
- **Color Algorithm**: Red (0-4.9) → Yellow (5.0-5.9) → Green (6.0-10.0) with star emoji for perfect 10.0
- **Responsive Design**: Modal popups with measure details including confidence, notes, and practice metadata
- **API Endpoints**: RESTful design with `/api/books`, `/api/songs`, `/api/songs/:id/pages`, `/api/songs/:id/measures`
- **Page Positioning**: Supports songs starting on left or right pages for realistic book layout

## Development Status
Production-ready with complete confidence visualization, unified measure editing interface, full database integration, and automatic history tracking. Features a consistent editable form experience where all measures (existing and new) use the same intuitive popup interface with smart pre-population. All measure updates are automatically preserved in history for complete audit trail. Ready for use with existing Köln Concert and Goldberg Variations data.

## Recent Updates
- **Confidence Input Bug Fix**: Resolved autoselection issue that interrupted typing in confidence input field
- **Historical Data Preservation**: Implemented automatic backup of measure data to `song_measure_history` table before updates

## Component Structure
- `App.jsx` - Main application with book/song selection and data fetching
- `PracticeTrackerPage.jsx` - Individual page component with measure visualization
- `App.css` - Styling for layout, confidence colors, and interactive popups
- `backend/server.js` - Express API server with SQLite database connection

## API Reference
- `GET /api/books` - List all music books
- `GET /api/songs` - List all songs
- `GET /api/songs/:id/pages` - Get page/measure layout for a song
- `GET /api/songs/:id/measures` - Get measure confidence data for a song
- `POST /api/songs/:id/measures` - Create or update measure confidence record (with automatic book_id lookup and history preservation)
- `GET /api/songs/:id/practice-sessions` - Get practice sessions for a song
- `POST /api/practice-sessions` - Create new practice session