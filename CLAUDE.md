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
- **Interactive Measure Details**: Click any colored measure to view confidence levels, practice notes, timestamps, and practitioner information
- **Real-time Database Integration**: Connects directly to existing practice tracking system without schema changes

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
- `music_book` - Book organization
- `practice_session` - Practice history (future integration)

## Technical Details
- **Color Algorithm**: Red (0-4.9) → Yellow (5.0-5.9) → Green (6.0-10.0) with star emoji for perfect 10.0
- **Responsive Design**: Modal popups with measure details including confidence, notes, and practice metadata
- **API Endpoints**: RESTful design with `/api/books`, `/api/songs`, `/api/songs/:id/pages`, `/api/songs/:id/measures`
- **Page Positioning**: Supports songs starting on left or right pages for realistic book layout

## Development Status
Production-ready with complete confidence visualization, interactive popups, book filtering, and full database integration. Ready for use with existing Köln Concert and Goldberg Variations data.

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
- `GET /api/songs/:id/practice-sessions` - Get practice sessions for a song
- `POST /api/practice-sessions` - Create new practice session