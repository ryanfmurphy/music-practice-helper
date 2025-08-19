# Music Practice Helper TODO

## Current Features
- ✅ Song selection dropdown from database
- ✅ Dynamic page/measure display from database
- ✅ Express.js backend with SQLite integration
- ✅ Auto-selection of Köln Concert Part I
- ✅ Measure-level practice session logging

## Bugs

- [x] Stop autoselecting in the middle of typing confidence level
- [x] In the popup/modal, filter the history to the currently chosen practitioner
- [ ] Fix time zone issue with song_measure timestamps

## Planned Features

- [ ] Allow deleting a measure's details
- [ ] Keep history of past measure details (in separate table?)

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
