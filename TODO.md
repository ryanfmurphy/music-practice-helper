# Music Practice Helper TODO

## Current Features
- ✅ Song selection dropdown from database
- ✅ Dynamic page/measure display from database
- ✅ Express.js backend with SQLite integration
- ✅ Auto-selection of Köln Concert Part I
- ✅ Measure-level practice session logging

## Bugs
- [x] Fix bug with sticky header - after switching hands and trying to scroll up, sticky header disappears
- [ ] Fix time zone issue with song_measure timestamps
- [ ] (Fixed?) Fix occasional bug when updating a measure detail with multiple records
  - The wrong color/emojis show up, but then when you refresh they're fixed
  - Steps to reproduce? Fixed?
- [ ] Fix shrunken music line when image is too big vertically
  - Allow overflow down but not up?

- [x] Issue has returned: Re-selecting Confidence level input text with every keystroke
- [x] Stop autoselecting in the middle of typing confidence level
- [x] In the popup/modal, filter the history to the currently chosen practitioner
- [x] Did the traffic light colors get nerfed to have fewer gradient shades?
- [x] Issue has returned: No longer auto-selecting the Confidence level text in the input

## Planned Features

- [ ] Add "show_progress" toggle (when unchecked remove the measure boxes)
- [ ] Store % widths for measure boxes on song_page_line, and display measure boxes with min-width: X%
  - Allows lining up with sheet music better
- [ ] Add bpm_denominator to song_measure. ENUM values = whole,half,quarter,dotted-quarter,8th,16th
- [ ] Allow deleting a measure's details

- [x] Add "facing_pages" toggle (allow larger 1-page mode)
- [x] Dark mode
- [x] Keep history of past measure details (in separate table)

## Style tweaks

- [ ] Make Dark Mode look nicer
- [x] Lighten the border and number color of un-detailed measures (gray)

### Layout & Display
- [ ] Add support for a song's 1st page to be the right page instead of left page
- [ ] Filter songs in drop-down to only include ones with page_line data

### Music Structure
- [ ] Add support to visualize parts of songs
  - Show song parts/sections within pages
  - Highlight part boundaries
  - Part selection/navigation

### Practice Tracking
- [ ] Add support to visualize practice sessions
  - Show which measures have been practiced
  - Display confidence levels with color coding
  - Show recent practice activity
  - Click measures to log new practice sessions

### Future Enhancements
- [ ] Practice session filtering and search
- [ ] Progress charts and analytics
- [ ] Integration with YouTube timestamps
- [ ] Sheet music PDF integration
- [ ] Mobile-responsive design
- [ ] Export practice reports
