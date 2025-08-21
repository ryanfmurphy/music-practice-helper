# Music Practice Helper TODO

## Current Features
- ✅ Song selection dropdown from database
- ✅ Dynamic page/measure display from database
- ✅ Express.js backend with SQLite integration
- ✅ Auto-selection of Köln Concert Part I
- ✅ Measure-level practice session logging

## Bugs
- [ ] Issue has returned: Re-selecting Confidence level input text with every keystroke
- [ ] Fix time zone issue with song_measure timestamps

- [x] Stop autoselecting in the middle of typing confidence level
- [x] In the popup/modal, filter the history to the currently chosen practitioner
- [x] Did the traffic light colors get nerfed to have fewer gradient shades?
- [x] Issue has returned: No longer auto-selecting the Confidence level text in the input

## Planned Features

- [ ] Add "facing_pages" toggle (allow larger 1-page mode)
- [ ] Add bpm_denominator to song_measure. ENUM values = whole,half,quarter,dotted-quarter,8th,16th
- [ ] Allow deleting a measure's details

- [x] Keep history of past measure details (in separate table)

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
