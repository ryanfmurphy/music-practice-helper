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
- **Hands Filtering**: Hands dropdown (Both/Right/Left) to filter practice data by hand positions with multi-hands support
- **Dynamic Page Layout**: Displays actual sheet music pages with proper left/right book positioning
- **Facing Pages Toggle**: Switch between traditional book layout (2 pages side-by-side) and single page full-width view
- **Dark Mode**: Complete dark theme implementation with toggle switch for reduced eye strain during practice
- **Show Sheet Music Toggle**: Control visibility of actual notation images below measure boxes
- **Confidence Visualization**: Traffic light color system (red → yellow → green) showing practice progress on individual measures
- **Smart Multi-Record Indicators**: Intelligent emoji system showing 👥 for multiple practitioners, 🙌 for multiple hands, 👥🙌 for both
- **Color-Coded Multiple Records**: Purple for multiple practitioners, cornflower blue for multiple hands, blended color for both
- **Corner Confidence Display**: Confidence ratings appear in top right corner of measures with star emoji for perfect 10s
- **Unified Measure Editing**: Click any measure to open the same editable form interface for consistent user experience
- **Smart Form Pre-population**: Existing measures automatically fill form fields, new measures default to selected user and hands
- **BPM Tracking**: Optional tempo tracking for each measure with historical preservation
- **Expandable History**: Click to view complete audit trail of confidence changes with timestamps and filtering
- **Real-time Updates**: All changes immediately appear with correct color coding without page refresh
- **Real-time Database Integration**: Connects directly to existing practice tracking system with automatic book_id resolution
- **Automatic History Tracking**: All measure updates preserve previous data in `measure_confidence_history` table for complete audit trail
- **Global Measure Selection**: "Select Measures" mode in sticky header enables multi-measure selection across all pages
- **Bulk Editing**: Edit multiple selected measures simultaneously with shared confidence levels, notes, and BPM
- **Smart Selection Styling**: White borders for colored measures, blue borders for empty measures, with dark outlines for visibility
- **Sticky Header Controls**: Selection controls stay visible in fixed header during scroll for easy access
- **Keyboard Shortcuts**: Shift-click measures to auto-enable selection; Enter opens bulk edit for selected measures; ESC clears selection then exits selection mode; ESC closes modals
- **Text Selection Prevention**: User text selection disabled in practice areas to prevent interference with measure selection
- **Auto-Scroll Feature**: Optional automatic scrolling functionality for hands-free reading during practice sessions
- **Persistent Settings**: All sticky header selections (book, song, user, hands, BPM, checkboxes) automatically save to localStorage and restore on page refresh

## Keyboard Shortcuts
- **Shift + Click Measure**: Auto-enable Selection Mode and select clicked measure
- **Enter (with measures selected)**: Open Bulk Edit Modal for selected measures
- **ESC (in Selection Mode)**: 
  - First press: Clear selected measures (stay in Selection Mode)
  - Second press: Exit Selection Mode entirely
- **ESC (in Modals)**: Close any open modal

## Quick Start
```bash
# Backend (from backend/)
npm install && npm start

# Frontend (from root directory)
npm run dev
```

## Database Tables Used
- `songs` - Song metadata and book assignments
- `song_page_lines` - Page/line layout with measure counts
- `measure_confidence` - Individual measure confidence levels, practice notes, BPM, practicer, and hands tracking
- `measure_confidence_history` - Historical versions of measure data with timestamps for complete audit trail
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
Production-ready with complete multi-user confidence visualization, unified measure editing interface, full database integration, and automatic history tracking. Features a consistent editable form experience with BPM tracking, expandable history display, and independent user data isolation. All measure updates are automatically preserved in history for complete audit trail. Includes global measure selection with bulk editing capabilities and intelligent sticky header controls. **Enhanced UI Features**: Dark mode, facing pages toggle, show/hide sheet music, visual styling improvements, and optimized UX performance. Ready for use with existing Köln Concert and Goldberg Variations data.

## Recent Updates
- **Dark Mode Implementation**: Complete dark theme with toggle switch, including proper styling for all components and modals
- **Facing Pages Toggle**: Switch between traditional book layout (2 pages side-by-side) and single page full-width view for better flexibility
- **Show Sheet Music Toggle**: Control visibility of actual notation images below measure boxes for cleaner practice view
- **UX Performance Improvements**: 
  - Optimized useEffect dependencies to prevent unnecessary page refreshes when changing user/hands
  - Fixed sticky header disappearing issues
  - Improved bulk edit workflow (selection mode persists after edits)
  - Fixed confidence input selection issues in measure detail popup
- **Sheet Music Image Display**: Displays actual notation images below measure boxes for enhanced practice experience
  - Images stored in `public/sheet-music/` with paths like `Koln-Concert/p8/line1.png`
  - Database column `sheet_music_img_path` references relative paths from `public/sheet-music/`
  - Images display in 150px containers with centered positioning below measures
  - Lines with images get reduced 20px measure boxes (half normal height) for better visual hierarchy
  - Backend API includes `linesData` array with complete line information including image paths
  - Currently implemented for Köln Concert pages 8, 18-21 with database paths configured
- **Global Measure Selection**: Moved "Select Measures" checkbox to sticky header for global multi-page selection
- **Bulk Edit Integration**: Edit/Clear buttons now in sticky header with proper BulkEditModal integration
- **Smart Selection Borders**: White borders for colored measures, blue for empty measures, dark outlines for visibility
- **Sticky Header Improvements**: Fixed timing issues, selection controls positioned on right side of header
- **Hands Filtering**: Added hands dropdown with Both/Right/Left options and multi-hands support per measure
- **Smart Multi-Record Indicators**: Intelligent emoji system (👥 for multiple practitioners, 🙌 for multiple hands, 👥🙌 for both)
- **Color-Coded Backgrounds**: Purple for multiple practitioners, cornflower blue for multiple hands, blended for both
- **Enhanced History Layout**: Improved expandable history with full-width display and smooth arrow rotation
- **Multi-User Support**: Added user dropdown with independent data tracking per practitioner
- **BPM Tracking**: Optional tempo field with historical preservation
- **Enhanced History Display**: Expandable history section with timestamps and BPM data
- **Corner Confidence Display**: Confidence ratings shown in measure corners with bright stars for perfect 10s
- **Backend Filtering**: Efficient API filtering by practicer and hands for improved performance
- **Smart Defaults**: New measures automatically default to selected user and hands
- **Auto-Scroll Feature**: Added "Scroll" checkbox that enables automatic page scrolling (2px every 500ms) for hands-free practice reading

## Component Structure
- `App.jsx` - Main application with book/song selection and data fetching
- `PracticeTrackerPage.jsx` - Individual page component with measure visualization
- `App.css` - Styling for layout, confidence colors, and interactive popups
- `backend/server.js` - Express API server with SQLite database connection

## API Reference
- `GET /api/books` - List all music books
- `GET /api/songs` - List all songs
- `GET /api/songs/:id/pages` - Get page/measure layout for a song
- `GET /api/songs/:id/measures` - Get measure confidence data for a song (optional ?practicer= and ?hands= filters)
- `GET /api/songs/:id/measures/:page/:line/:measure/history` - Get historical changes for a specific measure (optional ?practicer= and ?hands= filters)
- `POST /api/songs/:id/measures` - Create or update measure confidence record (with automatic book_id lookup, hands tracking, and history preservation)
- `GET /api/songs/:id/practice-sessions` - Get practice sessions for a song
- `POST /api/practice-sessions` - Create new practice session