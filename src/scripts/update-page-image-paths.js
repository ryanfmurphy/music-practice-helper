#!/usr/bin/env node

/**
 * Script: update-page-image-paths.js
 * Purpose: Update sheet_music_img_path for all lines on a given page in the database
 * Usage: node update-page-image-paths.js <song_folder> <page_number> [book_id] [song_id]
 * 
 * Convention: Images are stored as {song_folder}/p{page}/line{line}.png
 * Example: page 10, line 3 = "Koln-Concert/p10/line3.png"
 */

import fs from 'fs';
import path from 'path';
import sqlite3 from 'sqlite3';

// Default values for Köln Concert
const DEFAULT_BOOK_ID = 1;
const DEFAULT_SONG_ID = 4;

// Check arguments
if (process.argv.length < 4 || process.argv.length > 6) {
    console.log('Usage: node update-page-image-paths.js <song_folder> <page_number> [book_id] [song_id]');
    console.log('');
    console.log('Arguments:');
    console.log('  song_folder  - The song folder name (e.g., "Koln-Concert", "Well-Tempered-Clavier")');
    console.log('  page_number  - The page number to update (required)');
    console.log('  book_id      - Book ID (default: 1 for Köln Concert)');
    console.log('  song_id      - Song ID (default:', DEFAULT_SONG_ID, ')');
    console.log('');
    console.log('Examples:');
    console.log('  node update-page-image-paths.js Koln-Concert 10');
    console.log('  node update-page-image-paths.js Well-Tempered-Clavier 25 2 5');
    process.exit(1);
}

const songFolder = process.argv[2];
const pageNumber = parseInt(process.argv[3]);
const bookId = process.argv[4] ? parseInt(process.argv[4]) : DEFAULT_BOOK_ID;
const songId = process.argv[5] ? parseInt(process.argv[5]) : DEFAULT_SONG_ID;

// Validate page number
if (isNaN(pageNumber) || pageNumber <= 0) {
    console.error('Error: Page number must be a positive integer');
    process.exit(1);
}

// Validate book and song IDs
if (isNaN(bookId) || bookId <= 0) {
    console.error('Error: Book ID must be a positive integer');
    process.exit(1);
}

if (isNaN(songId) || songId <= 0) {
    console.error('Error: Song ID must be a positive integer');
    process.exit(1);
}

const dbPath = path.resolve('backend/music-practice-helper.db');

// Check if database exists
if (!fs.existsSync(dbPath)) {
    console.error(`Error: Database file not found at ${dbPath}`);
    process.exit(1);
}

// Connect to database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
        process.exit(1);
    }
});

async function updatePageImagePaths() {
    try {
        console.log(`Updating sheet music image paths for page ${pageNumber} (book_id: ${bookId}, song_id: ${songId})`);
        
        // First, check what lines exist for this page
        const checkQuery = `
            SELECT id, line_number_on_page, sheet_music_img_path 
            FROM song_page_lines 
            WHERE page_number = ? AND book_id = ? AND song_id = ?
            ORDER BY line_number_on_page
        `;
        
        const lines = await new Promise((resolve, reject) => {
            db.all(checkQuery, [pageNumber, bookId, songId], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        
        if (lines.length === 0) {
            console.log(`No lines found for page ${pageNumber} with book_id ${bookId} and song_id ${songId}`);
            return;
        }
        
        console.log(`Found ${lines.length} lines for page ${pageNumber}`);
        
        // Check if corresponding image directory exists
        const imageDir = path.resolve(`public/sheet-music/${songFolder}/p${pageNumber}`);
        const imageDirExists = fs.existsSync(imageDir);
        
        if (!imageDirExists) {
            console.log(`Warning: Image directory does not exist: ${imageDir}`);
            console.log('Proceeding anyway - paths will be set but images may not be available');
        }
        
        let updatedCount = 0;
        let skippedCount = 0;
        
        // Update each line
        for (const line of lines) {
            const lineNumber = line.line_number_on_page;
            const imagePath = `${songFolder}/p${pageNumber}/line${lineNumber}.png`;
            
            // Check if image file actually exists
            const imageFilePath = path.resolve(`public/sheet-music/${imagePath}`);
            const imageExists = fs.existsSync(imageFilePath);
            
            if (!imageExists) {
                console.log(`Warning: Image file does not exist: ${imageFilePath}`);
                console.log(`Skipping line ${lineNumber}`);
                skippedCount++;
                continue;
            }
            
            // Update the database record
            const updateQuery = `
                UPDATE song_page_lines 
                SET sheet_music_img_path = ?
                WHERE id = ?
            `;
            
            await new Promise((resolve, reject) => {
                db.run(updateQuery, [imagePath, line.id], function(err) {
                    if (err) reject(err);
                    else resolve();
                });
            });
            
            console.log(`Updated line ${lineNumber}: ${line.sheet_music_img_path || 'null'} -> ${imagePath}`);
            updatedCount++;
        }
        
        console.log(`\nCompleted successfully:`);
        console.log(`- Updated: ${updatedCount} lines`);
        console.log(`- Skipped: ${skippedCount} lines (missing image files)`);
        
    } catch (error) {
        console.error('Error updating database:', error.message);
        process.exit(1);
    } finally {
        // Close database connection
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            }
        });
    }
}

// Run the update
updatePageImagePaths();
