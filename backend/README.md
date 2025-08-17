# Music Practice Helper Backend

Express.js API server that provides access to music practice data stored in a SQLite database. Serves song metadata, page layouts, and practice session data to the React frontend.

## Features

- **Song Management**: Retrieve song metadata and details
- **Page Layout API**: Get measure-by-measure page structure for sheet music
- **Practice Sessions**: Track and retrieve practice history (endpoints ready)
- **SQLite Integration**: Direct connection to existing practice database
- **CORS Support**: Configured for frontend integration

## API Endpoints

### Songs
- `GET /api/songs` - List all songs with metadata
- `GET /api/songs/:id` - Get specific song details
- `GET /api/songs/:id/pages` - Get page/measure layout for a song

### Practice Sessions (Ready for Implementation)
- `GET /api/songs/:id/practice-sessions` - Get all practice sessions for a song
- `POST /api/practice-sessions` - Create new practice session
- `GET /api/songs/:id/measures/:from/:to/sessions` - Get sessions for specific measure range

### Health
- `GET /api/health` - API health check

## Database Schema

Connects to `../../../sqlite_mcp_server.db` with tables:
- **songs**: Song metadata (title, artist, year, URLs, etc.)
- **song_page_lines**: Page structure (page number, line, measures per line)
- **practice_session**: Practice tracking (session type, confidence, duration, etc.)

## Installation & Usage

```bash
# Install dependencies
npm install

# Start development server (with auto-restart)
npm run dev

# Start production server
npm start
```

Server runs on **http://localhost:3001**

## Configuration

- **Port**: 3001 (configurable via PORT environment variable)
- **Database**: SQLite file at `../../../sqlite_mcp_server.db`
- **CORS**: Enabled for all origins (development setup)

## Database Connection

The server automatically connects to the SQLite database on startup and provides graceful shutdown handling. All database operations are promisified for modern async/await usage.

## Error Handling

- Database connection errors logged on startup
- API endpoints return proper HTTP status codes
- JSON error responses with descriptive messages
- Graceful shutdown on SIGINT (Ctrl+C)