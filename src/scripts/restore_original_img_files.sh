#!/bin/bash

# Function to show usage
show_usage() {
    echo "USAGE: restore_original_img_files.sh"
    echo ""
    echo "Restore original sheet music line images from .orig.png backup files."
    echo "This undoes the rotation applied by adjust-rotation-of-page-lines.sh"
    echo ""
    echo "REQUIREMENTS:"
    echo "  - Must be run from within a page directory under public/sheet-music/"
    echo "  - Looks for *.orig.png files in current directory"
    echo "  - Restores them by moving back to original filenames"
    echo ""
    echo "EXAMPLES:"
    echo "  cd public/sheet-music/Koln-Concert/p8/"
    echo "  restore_original_img_files.sh"
    echo ""
    echo "NOTE: This will overwrite any existing line*.png files with the .orig.png versions"
}

# Check if help requested
if [[ "$1" == "-h" || "$1" == "--help" ]]; then
    show_usage
    exit 0
fi

# Validate we're in the correct directory structure
if [[ ! "$PWD" =~ public/sheet-music/ ]]; then
    echo "ERROR: This script must be run from within the public/sheet-music/ directory structure"
    echo "Current directory: $PWD"
    echo ""
    show_usage
    exit 1
fi

# Find all .orig.png files
orig_files=()
for file in *.orig.png; do
    if [[ -f "$file" ]]; then
        orig_files+=("$file")
    fi
done

if [[ ${#orig_files[@]} -eq 0 ]]; then
    echo "ERROR: No .orig.png files found in current directory"
    echo "This script restores files from .orig.png backups created by adjust-rotation-of-page-lines.sh"
    echo ""
    show_usage
    exit 1
fi

# Show what will be restored
echo "Found ${#orig_files[@]} original files to restore: ${orig_files[*]}"
echo ""

# Ask for confirmation
echo "This will overwrite the following files:"
for orig_file in "${orig_files[@]}"; do
    target_file="${orig_file%.orig.png}.png"
    echo "  $orig_file → $target_file"
done
echo ""
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

# Restore each original file
for orig_file in "${orig_files[@]}"; do
    target_file="${orig_file%.orig.png}.png"
    echo "Restoring $orig_file → $target_file"
    mv "$orig_file" "$target_file"
done

echo ""
echo "Restoration complete! Original images have been restored."
echo "The .orig.png backup files have been removed."