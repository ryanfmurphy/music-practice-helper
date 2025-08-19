# Music Practice Helper Web Application

## Overview
A fully functional React-based web application for interactive music practice tracking. Provides visualization of sheet music pages with real-time practice progress display.

## Architecture
- **Frontend**: React 18 + Vite development server (localhost:5173)
- **Backend**: Express.js API server with SQLite integration (localhost:3001)
- **Database**: Uses main `sqlite_mcp_server.db` for songs, pages, measures, and practice data

## Key Features
- **Book & Song Navigation**: Dropdown selectors for filtering by music books and songs
- **Multi-User Support**: User dropdown to filter and track practice data independently for different practitioners
- **Dynamic Page Layout**: Displays actual sheet music pages with proper left/right book positioning
- **Confidence Visualization**: Traffic light color system (red → yellow → green) showing practice progress on individual measures
- **Corner Confidence Display**: Confidence ratings appear in top right corner of measures with star emoji for perfect 10s
- **Unified Measure Editing**: Click any measure to open the same editable form interface for consistent user experience
- **Smart Form Pre-population**: Existing measures automatically fill form fields, new measures default to selected user
- **BPM Tracking**: Optional tempo tracking for each measure with historical preservation
- **Expandable History**: Click to view complete audit trail of confidence changes with timestamps
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
- `song_measure` - Individual measure confidence levels, practice notes, BPM, and practicer tracking
- `song_measure_history` - Historical versions of measure data with timestamps for complete audit trail
- `music_book` - Book organization
- `practice_session` - Practice history (future integration)

## Technical Details
- **Color Algorithm**: Red (0-4.9) → Yellow (5.0-5.9) → Green (6.0-10.0) with star emoji for perfect 10.0
- **Multi-User Architecture**: Each practitioner can have independent confidence records for the same measure
- **Backend Filtering**: API supports practicer parameter for efficient data filtering
- **Responsive Design**: Modal popups with measure details including confidence, notes, BPM, and practice metadata
- **API Endpoints**: RESTful design with `/api/books`, `/api/songs`, `/api/songs/:id/pages`, `/api/songs/:id/measures`
- **Page Positioning**: Supports songs starting on left or right pages for realistic book layout

## Development Status
Production-ready with complete multi-user confidence visualization, unified measure editing interface, full database integration, and automatic history tracking. Features a consistent editable form experience with BPM tracking, expandable history display, and independent user data isolation. All measure updates are automatically preserved in history for complete audit trail. Ready for use with existing Köln Concert and Goldberg Variations data.

## Recent Updates
- **Multi-User Support**: Added user dropdown with independent data tracking per practitioner
- **BPM Tracking**: Optional tempo field with historical preservation
- **Enhanced History Display**: Expandable history section with timestamps and BPM data
- **Corner Confidence Display**: Confidence ratings shown in measure corners with bright stars for perfect 10s
- **Backend Filtering**: Efficient API filtering by practicer for improved performance
- **Smart Defaults**: New measures automatically default to selected user

## Component Structure
- `App.jsx` - Main application with book/song selection and data fetching
- `PracticeTrackerPage.jsx` - Individual page component with measure visualization
- `App.css` - Styling for layout, confidence colors, and interactive popups
- `backend/server.js` - Express API server with SQLite database connection

## API Reference
- `GET /api/books` - List all music books
- `GET /api/songs` - List all songs
- `GET /api/songs/:id/pages` - Get page/measure layout for a song
- `GET /api/songs/:id/measures` - Get measure confidence data for a song (optional ?practicer= filter)
- `GET /api/songs/:id/measures/:page/:line/:measure/history` - Get historical changes for a specific measure
- `POST /api/songs/:id/measures` - Create or update measure confidence record (with automatic book_id lookup and history preservation)
- `GET /api/songs/:id/practice-sessions` - Get practice sessions for a song
- `POST /api/practice-sessions` - Create new practice session