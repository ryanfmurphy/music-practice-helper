import React, { useState, useEffect } from 'react'
import './App.css'
import PracticeTrackerPage from './PracticeTrackerPage'

function App() {
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState('')
  const [songs, setSongs] = useState([])
  const [filteredSongs, setFilteredSongs] = useState([])
  const [selectedSong, setSelectedSong] = useState(null)
  const [pages, setPages] = useState([])
  const [firstPagePosition, setFirstPagePosition] = useState('left')
  const [measureConfidence, setMeasureConfidence] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_BASE = 'http://localhost:3001/api'

  useEffect(() => {
    fetchBooks()
    fetchSongs()
  }, [])

  useEffect(() => {
    if (selectedSong) {
      fetchPages(selectedSong.song_id)
      fetchMeasureConfidence(selectedSong.song_id)
    }
  }, [selectedSong])

  useEffect(() => {
    filterSongs()
  }, [songs, selectedBook])

  const fetchBooks = async () => {
    try {
      const response = await fetch(`${API_BASE}/books`)
      if (!response.ok) throw new Error('Failed to fetch books')
      const booksData = await response.json()
      setBooks(booksData)
    } catch (err) {
      setError(err.message)
    }
  }

  const fetchSongs = async () => {
    try {
      const response = await fetch(`${API_BASE}/songs`)
      if (!response.ok) throw new Error('Failed to fetch songs')
      const songsData = await response.json()
      setSongs(songsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filterSongs = () => {
    let filtered = songs
    
    if (selectedBook) {
      filtered = songs.filter(song => song.book_id === parseInt(selectedBook))
    }
    
    setFilteredSongs(filtered)
    
    // Auto-select song when filtering changes
    if (filtered.length > 0 && (!selectedSong || !filtered.find(s => s.song_id === selectedSong.song_id))) {
      // Try to auto-select Köln Concert Part I if available
      const kolnConcert = filtered.find(song => 
        song.title.includes('Köln') && song.title.includes('Part I')
      )
      if (kolnConcert) {
        setSelectedSong(kolnConcert)
      } else {
        setSelectedSong(filtered[0])
      }
    } else if (filtered.length === 0) {
      setSelectedSong(null)
      setPages([])
    }
  }

  const handleBookChange = (e) => {
    setSelectedBook(e.target.value)
  }

  const handleSongChange = (e) => {
    const song = filteredSongs.find(s => s.song_id === parseInt(e.target.value))
    setSelectedSong(song)
  }

  const fetchPages = async (songId) => {
    try {
      const response = await fetch(`${API_BASE}/songs/${songId}/pages`)
      if (!response.ok) throw new Error('Failed to fetch pages')
      const data = await response.json()
      setPages(data.pages)
      setFirstPagePosition(data.firstPagePosition)
    } catch (err) {
      setError(err.message)
    }
  }

  const fetchMeasureConfidence = async (songId) => {
    try {
      const response = await fetch(`${API_BASE}/songs/${songId}/measures`)
      if (!response.ok) throw new Error('Failed to fetch measure confidence')
      const measures = await response.json()
      
      // Convert to lookup object: {page-line-measure: confidence}
      const confidenceMap = {}
      measures.forEach(measure => {
        const key = `${measure.page_number}-${measure.line_number}-${measure.measure_number}`
        confidenceMap[key] = measure.confidence
      })
      setMeasureConfidence(confidenceMap)
    } catch (err) {
      console.warn('Failed to fetch measure confidence:', err.message)
      setMeasureConfidence({})
    }
  }

  if (loading) return <div className="container">Loading...</div>
  if (error) return <div className="container">Error: {error}</div>

  return (
    <div className="container">
      <div className="selectors">
        <div className="book-selector">
          <label htmlFor="book-select">Book: </label>
          <select 
            id="book-select"
            value={selectedBook} 
            onChange={handleBookChange}
          >
            <option value="">-- Select Book --</option>
            {books.map(book => (
              <option key={book.book_id} value={book.book_id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>

        <div className="song-selector">
          <label htmlFor="song-select">Song: </label>
          <select 
            id="song-select"
            value={selectedSong?.song_id || ''} 
            onChange={handleSongChange}
            disabled={filteredSongs.length === 0}
          >
            <option value="">-- Select Song --</option>
            {filteredSongs.map(song => (
              <option key={song.song_id} value={song.song_id}>
                {song.title} - {song.artist}
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSong && (
        <div className="song-info">
          <h2>{selectedSong.title}</h2>
          <p>by {selectedSong.artist} ({selectedSong.year})</p>
        </div>
      )}

      {pages.length > 0 ? (
        <div className="pages-grid">
          {(() => {
            const result = [];
            const startsOnRight = firstPagePosition === 'right';
            let pageIndex = 0;
            
            while (pageIndex < pages.length) {
              const isFirstRow = result.length === 0;
              const isLastPage = pageIndex === pages.length - 1;
              
              result.push(
                <div key={`row-${result.length}`} className="pages-container">
                  {/* Left slot */}
                  {isFirstRow && startsOnRight ? (
                    <div className="page-placeholder left-blank"></div>
                  ) : pageIndex < pages.length ? (
                    <PracticeTrackerPage {...pages[pageIndex++]} songId={selectedSong?.song_id} measureConfidence={measureConfidence} />
                  ) : null}
                  
                  {/* Right slot */}
                  {pageIndex < pages.length ? (
                    <PracticeTrackerPage {...pages[pageIndex++]} songId={selectedSong?.song_id} measureConfidence={measureConfidence} />
                  ) : isLastPage ? (
                    <div className="page-placeholder right-blank"></div>
                  ) : null}
                </div>
              );
            }
            
            return result;
          })()}
        </div>
      ) : (
        <div>No pages found for this song</div>
      )}
    </div>
  )
}

export default App
