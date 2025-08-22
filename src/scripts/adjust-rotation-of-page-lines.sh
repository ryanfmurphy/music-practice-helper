#!/bin/bash

# USAGE adjust-rotation-of-page-lines <num-degrees> [--dry-run]
# Run within a page of sheet music lines to rotate by a small degree to fix rotation issues
# - Requires imagemagick
# - Assumes 5 lines in the page
# - Use --dry-run to test rotation without overwriting original files

amount_to_rotate="$1"
dry_run=false

if [[ "$2" == "--dry-run" ]]; then
    dry_run=true
    echo "DRY RUN: Creating rotated files without overwriting originals..."
fi

convert line1.png -background white -rotate $amount_to_rotate line1_rotated.png
convert line2.png -background white -rotate $amount_to_rotate line2_rotated.png
convert line3.png -background white -rotate $amount_to_rotate line3_rotated.png
convert line4.png -background white -rotate $amount_to_rotate line4_rotated.png
convert line5.png -background white -rotate $amount_to_rotate line5_rotated.png

if [[ "$dry_run" == "false" ]]; then
    mv line1.png line1.orig.png
    mv line2.png line2.orig.png
    mv line3.png line3.orig.png
    mv line4.png line4.orig.png
    mv line5.png line5.orig.png
    mv line1_rotated.png line1.png
    mv line2_rotated.png line2.png
    mv line3_rotated.png line3.png
    mv line4_rotated.png line4.png
    mv line5_rotated.png line5.png
    echo "Rotation applied and originals backed up to .orig.png files"
else
    echo "DRY RUN COMPLETE: Check the line*_rotated.png files to see the result"
    echo "If satisfied, run without --dry-run to apply the rotation"
    echo "To clean up test files, run: rm line*_rotated.png"
fi
