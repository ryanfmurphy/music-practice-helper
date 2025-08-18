import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Database connection
const dbPath = join(__dirname, '..', '..', '..', 'sqlite_mcp_server.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to promisify database queries
const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
};

const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
};

// Routes

// Get all books
app.get('/api/books', async (req, res) => {
  try {
    const books = await dbAll('SELECT * FROM music_book ORDER BY title');
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all songs
app.get('/api/songs', async (req, res) => {
  try {
    const songs = await dbAll('SELECT * FROM songs ORDER BY title');
    res.json(songs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get song by ID
app.get('/api/songs/:id', async (req, res) => {
  try {
    const song = await dbGet('SELECT * FROM songs WHERE song_id = ?', [req.params.id]);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }
    res.json(song);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get page lines for a song
app.get('/api/songs/:id/pages', async (req, res) => {
  try {
    const song = await dbGet('SELECT first_page_position FROM songs WHERE song_id = ?', [req.params.id]);
    const pageLines = await dbAll(
      `SELECT page_number, line_number_on_page, num_measures, last_measure_overflows, start_time_secs
       FROM song_page_lines 
       WHERE song_id = ? 
       ORDER BY page_number, line_number_on_page`,
      [req.params.id]
    );
    
    // Group by page number and format for frontend
    const pages = {};
    let currentMeasure = 1;
    
    pageLines.forEach(line => {
      if (!pages[line.page_number]) {
        pages[line.page_number] = {
          pageNumber: line.page_number,
          lines: [],
          startingMeasure: currentMeasure
        };
      }
      pages[line.page_number].lines.push(line.num_measures);
      currentMeasure += line.num_measures;
    });
    
    const pagesArray = Object.values(pages);
    
    // Add first page position info to the response
    const response = {
      pages: pagesArray,
      firstPagePosition: song?.first_page_position || 'left'
    };
    
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get practice sessions for a song
app.get('/api/songs/:id/practice-sessions', async (req, res) => {
  try {
    const sessions = await dbAll(
      `SELECT * FROM practice_session 
       WHERE song_id = ? 
       ORDER BY practice_time DESC`,
      [req.params.id]
    );
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create a new practice session
app.post('/api/practice-sessions', async (req, res) => {
  try {
    const {
      song_id,
      part_number,
      from_measure,
      to_measure,
      from_page,
      to_page,
      session_type,
      notes,
      confidence_before,
      confidence_after,
      hands,
      playback_speed,
      practicers,
      duration_minutes
    } = req.body;

    const result = await dbRun(
      `INSERT INTO practice_session (
        song_id, part_number, from_measure, to_measure, from_page, to_page,
        session_type, notes, confidence_before, confidence_after, hands,
        playback_speed, practicers, duration_minutes, practice_time
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        song_id, part_number, from_measure, to_measure, from_page, to_page,
        session_type, notes, confidence_before, confidence_after, hands,
        playback_speed, practicers, duration_minutes
      ]
    );

    res.json({ id: result.id, ...req.body });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get practice sessions for specific measures
app.get('/api/songs/:id/measures/:from/:to/sessions', async (req, res) => {
  try {
    const sessions = await dbAll(
      `SELECT * FROM practice_session 
       WHERE song_id = ? 
       AND ((from_measure <= ? AND to_measure >= ?) OR (from_measure IS NULL AND to_measure IS NULL))
       ORDER BY practice_time DESC`,
      [req.params.id, req.params.to, req.params.from]
    );
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get measure confidence data for a song
app.get('/api/songs/:id/measures', async (req, res) => {
  try {
    const measures = await dbAll(
      `SELECT song_measure_id, page_number, line_number, measure_number, 
              confidence, time, notes, practicer
       FROM song_measure 
       WHERE song_id = ?
       ORDER BY page_number, line_number, measure_number`,
      [req.params.id]
    );
    res.json(measures);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create or update a measure confidence record
app.post('/api/songs/:id/measures', async (req, res) => {
  try {
    const songId = req.params.id;
    const {
      page_number,
      line_number,
      measure_number,
      confidence,
      notes = '',
      practicer = 'User'
    } = req.body;

    // Validate required fields
    if (!page_number || !line_number || !measure_number || confidence === undefined) {
      return res.status(400).json({ 
        error: 'Missing required fields: page_number, line_number, measure_number, confidence' 
      });
    }

    // Validate confidence range
    if (confidence < 0 || confidence > 10) {
      return res.status(400).json({ 
        error: 'Confidence must be between 0 and 10' 
      });
    }

    // Get the book_id for this song
    const song = await dbGet('SELECT book_id FROM songs WHERE song_id = ?', [songId]);
    if (!song) {
      return res.status(404).json({ error: 'Song not found' });
    }

    // Check if record already exists
    const existing = await dbGet(
      `SELECT song_measure_id FROM song_measure 
       WHERE song_id = ? AND page_number = ? AND line_number = ? AND measure_number = ?`,
      [songId, page_number, line_number, measure_number]
    );

    let result;
    if (existing) {
      // Update existing record
      result = await dbRun(
        `UPDATE song_measure 
         SET confidence = ?, notes = ?, practicer = ?, time = CURRENT_TIMESTAMP
         WHERE song_measure_id = ?`,
        [confidence, notes, practicer, existing.song_measure_id]
      );
      result.id = existing.song_measure_id;
    } else {
      // Create new record
      result = await dbRun(
        `INSERT INTO song_measure (
          book_id, song_id, page_number, line_number, measure_number, 
          confidence, notes, practicer, time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [song.book_id, songId, page_number, line_number, measure_number, confidence, notes, practicer]
      );
    }

    // Return the created/updated record
    const newRecord = await dbGet(
      `SELECT song_measure_id, page_number, line_number, measure_number, 
              confidence, time, notes, practicer
       FROM song_measure 
       WHERE song_measure_id = ?`,
      [result.id]
    );

    res.json(newRecord);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Music Practice Helper API running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down gracefully...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});