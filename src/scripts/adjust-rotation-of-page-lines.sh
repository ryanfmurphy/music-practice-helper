#!/bin/bash

# Function to show usage
show_usage() {
    echo "USAGE: adjust-rotation-of-page-lines.sh <num-degrees> [--dry-run]"
    echo ""
    echo "Rotate sheet music line images by a small degree to fix rotation issues."
    echo ""
    echo "ARGUMENTS:"
    echo "  <num-degrees>  Number of degrees to rotate (e.g., 0.5, -1.2)"
    echo "  --dry-run      Test rotation without overwriting original files"
    echo ""
    echo "REQUIREMENTS:"
    echo "  - Must be run from within a page directory under public/sheet-music/"
    echo "  - Requires ImageMagick (convert command)"
    echo "  - Processes all line*.png files found in current directory"
    echo ""
    echo "EXAMPLES:"
    echo "  cd public/sheet-music/Koln-Concert/p8/"
    echo "  adjust-rotation-of-page-lines.sh 0.5 --dry-run"
    echo "  adjust-rotation-of-page-lines.sh -1.2"
}

# Check if no arguments provided
if [[ $# -eq 0 ]]; then
    show_usage
    exit 1
fi

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

# Find all line{n}.png files (but not line{n}_rotated.png or line{n}.orig.png)
line_files=()
for file in line*.png; do
    if [[ -f "$file" && ! "$file" =~ _rotated\.png$ && ! "$file" =~ \.orig\.png$ ]]; then
        line_files+=("$file")
    fi
done

if [[ ${#line_files[@]} -eq 0 ]]; then
    echo "ERROR: No line*.png files found in current directory"
    echo "This script processes files matching the pattern line*.png (e.g., line1.png, line2.png)"
    echo "but excludes *_rotated.png and *.orig.png files"
    echo ""
    show_usage
    exit 1
fi

# Check if ImageMagick is available
if ! command -v convert >&/dev/null; then
    echo "ERROR: ImageMagick 'convert' command not found"
    echo "Please install ImageMagick: brew install imagemagick"
    exit 1
fi

amount_to_rotate="$1"
dry_run=false

# Validate rotation amount is a number
if ! [[ "$amount_to_rotate" =~ ^-?[0-9]+\.?[0-9]*$ ]]; then
    echo "ERROR: Invalid rotation amount '$amount_to_rotate'"
    echo "Please provide a valid number (e.g., 0.5, -1.2)"
    echo ""
    show_usage
    exit 1
fi

if [[ "$2" == "--dry-run" ]]; then
    dry_run=true
    echo "DRY RUN: Creating rotated files without overwriting originals..."
fi

# Process each line file found
echo "Found ${#line_files[@]} line files to process: ${line_files[*]}"

for line_file in "${line_files[@]}"; do
    base_name="${line_file%.png}"
    rotated_file="${base_name}_rotated.png"
    orig_file="${base_name}.orig.png"
    
    echo "Processing $line_file..."
    convert "$line_file" -background white -rotate "$amount_to_rotate" "$rotated_file"
done

if [[ "$dry_run" == "false" ]]; then
    for line_file in "${line_files[@]}"; do
        base_name="${line_file%.png}"
        rotated_file="${base_name}_rotated.png"
        orig_file="${base_name}.orig.png"
        
        mv "$line_file" "$orig_file"
        mv "$rotated_file" "$line_file"
    done
    echo "Rotation applied and originals backed up to .orig.png files"
else
    echo "DRY RUN COMPLETE: Check the line*_rotated.png files to see the result"
    echo "If satisfied, run without --dry-run to apply the rotation"
    echo "To clean up test files, run: rm line*_rotated.png"
fi
