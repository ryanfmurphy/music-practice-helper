#!/usr/bin/env node

/**
 * Script: rename-music-line-images.js
 * Purpose: Rename PNG files in a directory to line1.png, line2.png, etc. based on timestamp order
 * Usage: node rename-music-line-images.js <song_folder> <page_number>
 * Alternative: node rename-music-line-images.js <full_directory_path>
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Check arguments
if (process.argv.length < 3 || process.argv.length > 4) {
    console.log('Usage: node rename-music-line-images.js <song_folder> <page_number>');
    console.log('   OR: node rename-music-line-images.js <full_directory_path>');
    console.log('');
    console.log('Examples:');
    console.log('  node rename-music-line-images.js Koln-Concert 10');
    console.log('  node rename-music-line-images.js Well-Tempered-Clavier 25');
    console.log('  node rename-music-line-images.js /full/path/to/sheet-music/Koln-Concert/p10');
    process.exit(1);
}

let directoryPath;

if (process.argv.length === 4) {
    // Two arguments: song folder and page number
    const songFolder = process.argv[2];
    const pageNumber = process.argv[3];
    
    // Build path relative to the public/sheet-music directory
    const publicSheetMusicPath = path.join(__dirname, '..', '..', 'public', 'sheet-music');
    directoryPath = path.join(publicSheetMusicPath, songFolder, `p${pageNumber}`);
    
    console.log(`Working with song folder: ${songFolder}, page: ${pageNumber}`);
    console.log(`Target directory: ${directoryPath}`);
} else {
    // One argument: full directory path (backward compatibility)
    directoryPath = process.argv[2];
    console.log(`Using provided directory path: ${directoryPath}`);
}

// Check if directory exists
if (!fs.existsSync(directoryPath)) {
    console.error(`Error: Directory '${directoryPath}' does not exist`);
    process.exit(1);
}

// Check if it's actually a directory
if (!fs.statSync(directoryPath).isDirectory()) {
    console.error(`Error: '${directoryPath}' is not a directory`);
    process.exit(1);
}

try {
    // Read all files in the directory
    const files = fs.readdirSync(directoryPath);
    
    // Filter for PNG files only
    const pngFiles = files.filter(file => path.extname(file).toLowerCase() === '.png');
    
    if (pngFiles.length === 0) {
        console.log(`No PNG files found in directory '${directoryPath}'`);
        process.exit(0);
    }
    
    console.log(`Found ${pngFiles.length} PNG files in '${directoryPath}'`);
    console.log('Renaming files based on timestamp order...');
    
    // Get file stats and sort by modification time (oldest first)
    const fileStats = pngFiles.map(file => {
        const filePath = path.join(directoryPath, file);
        const stats = fs.statSync(filePath);
        return {
            name: file,
            path: filePath,
            mtime: stats.mtime
        };
    });
    
    // Sort by modification time (oldest first)
    fileStats.sort((a, b) => a.mtime - b.mtime);
    
    // Create temporary names to avoid conflicts
    const tempRenames = [];
    
    // First pass: rename all files to temporary names
    fileStats.forEach((file, index) => {
        const tempName = `temp_${index + 1}_${Date.now()}.png`;
        const tempPath = path.join(directoryPath, tempName);
        
        console.log(`Temp renaming: '${file.name}' -> '${tempName}'`);
        fs.renameSync(file.path, tempPath);
        
        tempRenames.push({
            tempPath: tempPath,
            finalName: `line${index + 1}.png`,
            originalName: file.name
        });
    });
    
    // Second pass: rename temporary files to final names
    tempRenames.forEach(item => {
        const finalPath = path.join(directoryPath, item.finalName);
        console.log(`Final renaming: '${item.originalName}' -> '${item.finalName}'`);
        fs.renameSync(item.tempPath, finalPath);
    });
    
    console.log(`Successfully renamed ${fileStats.length} files`);
    console.log('Files are now named line1.png, line2.png, etc. in chronological order');
    
} catch (error) {
    console.error('Error processing files:', error.message);
    process.exit(1);
}