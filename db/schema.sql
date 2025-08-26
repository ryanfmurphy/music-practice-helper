CREATE TABLE music_book (
    book_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT,
    publisher TEXT,
    year INTEGER,
    added_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE songs (
    song_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    artist TEXT NOT NULL,
    album TEXT,
    year INTEGER,
    genre TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
, audio_url TEXT, sheet_music_url TEXT, lyrics_url TEXT, youtube_url TEXT, sheet_music_url_local TEXT, book_id INTEGER REFERENCES music_book(id), first_page_position TEXT DEFAULT 'left' CHECK (first_page_position IN ('left', 'right')));
CREATE TABLE IF NOT EXISTS "song_page_lines" (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    song_id INTEGER,
    page_number INTEGER NOT NULL,
    line_number_on_page INTEGER NOT NULL,
    num_measures INTEGER NOT NULL,
    last_measure_overflows INTEGER NOT NULL DEFAULT 0,
    start_time_secs INTEGER
, sheet_music_img_path TEXT);
CREATE TABLE measure_confidence (
    measure_confidence_id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    song_id INTEGER,
    page_number INTEGER NOT NULL,
    line_number INTEGER NOT NULL,
    measure_number INTEGER NOT NULL,
    confidence REAL NOT NULL,
    time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    practicer TEXT, bpm REAL, hands TEXT NOT NULL DEFAULT 'both' CHECK (hands IN ('left', 'right', 'both')),
    FOREIGN KEY (book_id) REFERENCES music_book(book_id),
    FOREIGN KEY (song_id) REFERENCES songs(song_id)
);
CREATE TABLE measure_confidence_history (
    measure_confidence_id INTEGER,
    book_id INTEGER NOT NULL,
    song_id INTEGER,
    page_number INTEGER NOT NULL,
    line_number INTEGER NOT NULL,
    measure_number INTEGER NOT NULL,
    confidence REAL NOT NULL,
    time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    notes TEXT,
    practicer TEXT,
    archived_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, bpm REAL, hands TEXT NOT NULL DEFAULT 'both' CHECK (hands IN ('left', 'right', 'both')),
    PRIMARY KEY (measure_confidence_id, archived_at)
);
