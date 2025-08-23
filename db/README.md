# Database Schema

This directory contains the database schema for the Music Practice Helper web application.

## Files

- `schema.sql` - Schema-only dump of the tables used by the web application

## Tables Included

The web application uses the following tables from the main `sqlite_mcp_server.db`:

- **music_book** - Music books/collections
- **songs** - Individual songs with metadata
- **song_page_lines** - Page/line layout structure with measure counts
- **song_measure** - Current confidence levels and practice data for individual measures
- **song_measure_history** - Historical versions of measure data with timestamps

## Usage

To create a new database with this schema:

```bash
sqlite3 new_database.db < schema.sql
```

## Notes

- This schema is extracted from the main project database and only includes tables actually used by the web frontend
- The `practice_session` table exists in the backend API but is not used by the web application frontend
- Schema includes the latest additions like `hide_to_memorize` column in `song_page_lines`