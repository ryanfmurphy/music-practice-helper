import React, { useState, useEffect, useRef } from 'react'
import './App.css'
import PracticeTrackerPage from './PracticeTrackerPage'
import BulkEditModal from './BulkEditModal'

function App() {
  const [books, setBooks] = useState([])
  const [selectedBook, setSelectedBook] = useState('')
  const [songs, setSongs] = useState([])
  const [filteredSongs, setFilteredSongs] = useState([])
  const [selectedSong, setSelectedSong] = useState(null)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedHands, setSelectedHands] = useState('')
  const [pages, setPages] = useState([])
  const [firstPagePosition, setFirstPagePosition] = useState('left')
  const [measureDetails, setMeasureDetails] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSelectorsFixed, setIsSelectorsFixed] = useState(false)
  const selectorsRef = useRef(null)
  const selectorsStickyOffsetRef = useRef(0)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedMeasures, setSelectedMeasures] = useState(new Set())
  const [showBulkEdit, setShowBulkEdit] = useState(false)

  const API_BASE = 'http://localhost:3001/api'

  useEffect(() => {
    fetchBooks()
    fetchSongs()
  }, [])

  useEffect(() => {
    if (selectedSong) {
      fetchPages(selectedSong.song_id)
      fetchMeasureDetails(selectedSong.song_id)
    }
  }, [selectedSong, selectedUser, selectedHands])

  useEffect(() => {
    filterSongs()
  }, [songs, selectedBook])

  useEffect(() => {
    // Reset the sticky offset when pages change
    selectorsStickyOffsetRef.current = 0
    
    const handleScroll = () => {
      if (!selectorsRef.current) return

      // Calculate the offset where selectors should become fixed
      const selectorsTop = selectorsRef.current.getBoundingClientRect().top + window.scrollY
      const stickyOffset = selectorsTop

      // Store the offset for reference - but only once
      if (selectorsStickyOffsetRef.current === 0) {
        selectorsStickyOffsetRef.current = stickyOffset
      }

      const currentScrollY = window.scrollY
      const shouldBeFixed = currentScrollY >= selectorsStickyOffsetRef.current

      setIsSelectorsFixed(shouldBeFixed)
    }

    // Set initial offset
    const setInitialOffset = () => {
      if (selectorsRef.current) {
        const selectorsTop = selectorsRef.current.getBoundingClientRect().top + window.scrollY
        selectorsStickyOffsetRef.current = selectorsTop
      }
    }

    // Set initial offset after component mounts
    setTimeout(setInitialOffset, 100)

    window.addEventListener('scroll', handleScroll)
    window.addEventListener('resize', setInitialOffset)

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', setInitialOffset)
    }
  }, [pages]) // Re-run when pages change to recalculate offset


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

  const handleUserChange = (e) => {
    setSelectedUser(e.target.value)
  }

  const handleHandsChange = (e) => {
    setSelectedHands(e.target.value)
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

  const fetchMeasureDetails = async (songId) => {
    try {
      // Build URL with optional practicer and hands filters
      let url = `${API_BASE}/songs/${songId}/measures`
      const params = new URLSearchParams()
      
      if (selectedUser) {
        params.append('practicer', selectedUser)
      }
      if (selectedHands) {
        params.append('hands', selectedHands)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
      }
      
      const response = await fetch(url)
      if (!response.ok) throw new Error('Failed to fetch measure details')
      const measures = await response.json()
      
      // Convert to lookup object: {page-line-measure: [measureDetails]}
      const detailsMap = {}
      measures.forEach(measure => {
        const key = `${measure.page_number}-${measure.line_number}-${measure.measure_number}`
        const measureDetail = {
          id: measure.song_measure_id,
          confidence: measure.confidence,
          time: measure.time,
          notes: measure.notes,
          practicer: measure.practicer,
          bpm: measure.bpm,
          hands: measure.hands,
          page: measure.page_number,
          line: measure.line_number,
          measure: measure.measure_number
        }
        
        if (!detailsMap[key]) {
          detailsMap[key] = []
        }
        detailsMap[key].push(measureDetail)
      })
      setMeasureDetails(detailsMap)
    } catch (err) {
      console.warn('Failed to fetch measure details:', err.message)
      setMeasureDetails({})
    }
  }

  const handleMeasureUpdate = (savedMeasure) => {
    // Update the measureDetails state with the new/updated measure
    const key = `${savedMeasure.page_number}-${savedMeasure.line_number}-${savedMeasure.measure_number}`
    const measureDetail = {
      id: savedMeasure.song_measure_id,
      confidence: savedMeasure.confidence,
      time: savedMeasure.time,
      notes: savedMeasure.notes,
      practicer: savedMeasure.practicer,
      bpm: savedMeasure.bpm,
      hands: savedMeasure.hands,
      page: savedMeasure.page_number,
      line: savedMeasure.line_number,
      measure: savedMeasure.measure_number
    }
    
    setMeasureDetails(prev => {
      const existing = prev[key] || []
      // Find index of existing record with same practicer
      const existingIndex = existing.findIndex(item => item.practicer === savedMeasure.practicer)
      
      if (existingIndex >= 0) {
        // Update existing record
        const updated = [...existing]
        updated[existingIndex] = measureDetail
        return { ...prev, [key]: updated }
      } else {
        // Add new record
        return { ...prev, [key]: [...existing, measureDetail] }
      }
    })
  }

  const handleBulkSave = (savedMeasure) => {
    handleMeasureUpdate(savedMeasure)
  }

  const handleBulkClose = () => {
    setShowBulkEdit(false)
    // Exit selection mode and clear selections after bulk edit
    setIsSelectionMode(false)
    setSelectedMeasures(new Set())
  }

  if (loading) return <div className="container">Loading...</div>
  if (error) return <div className="container">Error: {error}</div>

  return (
    <div className="container">
      <header className="app-header">
        <h1>Music Practice Helper</h1>
        <p className="subtitle">Helping you grow your music practice</p>
      </header>
      
      {/* Spacer to prevent content jump when selectors become fixed */}
      {isSelectorsFixed && <div className="selectors-spacer"></div>}
      
      <div 
        ref={selectorsRef}
        className={`selectors ${isSelectorsFixed ? 'selectors-fixed' : ''}`}
      >
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

        <div className="user-selector">
          <label htmlFor="user-select">User: </label>
          <select 
            id="user-select"
            value={selectedUser} 
            onChange={handleUserChange}
          >
            <option value="">-- Select User --</option>
            <option value="Ryan">Ryan</option>
            <option value="Cliff">Cliff</option>
          </select>
        </div>

        <div className="hands-selector">
          <label htmlFor="hands-select">Hands: </label>
          <select 
            id="hands-select"
            value={selectedHands} 
            onChange={handleHandsChange}
          >
            <option value="">-- Select Hands --</option>
            <option value="both">Both</option>
            <option value="right">Right</option>
            <option value="left">Left</option>
          </select>
        </div>
        
        <div className="selection-controls">
          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={isSelectionMode}
              onChange={(e) => {
                setIsSelectionMode(e.target.checked)
                if (!e.target.checked) {
                  setSelectedMeasures(new Set())
                }
              }}
            />
            Select Measures
          </label>
          {selectedMeasures.size > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', color: '#666' }}>
                {selectedMeasures.size} selected
              </span>
              <button
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                onClick={() => setShowBulkEdit(true)}
              >
                Edit Selected
              </button>
              <button
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
                onClick={() => setSelectedMeasures(new Set())}
              >
                Clear
              </button>
            </div>
          )}
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
                    <PracticeTrackerPage 
                      {...pages[pageIndex++]} 
                      songId={selectedSong?.song_id}
                      selectedUser={selectedUser}
                      selectedHands={selectedHands}
                      measureDetails={measureDetails}
                      onMeasureUpdate={handleMeasureUpdate}
                      isSelectionMode={isSelectionMode}
                      selectedMeasures={selectedMeasures}
                      setSelectedMeasures={setSelectedMeasures}
                    />
                  ) : null}
                  
                  {/* Right slot */}
                  {pageIndex < pages.length ? (
                    <PracticeTrackerPage 
                      {...pages[pageIndex++]} 
                      songId={selectedSong?.song_id}
                      selectedUser={selectedUser}
                      selectedHands={selectedHands}
                      measureDetails={measureDetails}
                      onMeasureUpdate={handleMeasureUpdate}
                      isSelectionMode={isSelectionMode}
                      selectedMeasures={selectedMeasures}
                      setSelectedMeasures={setSelectedMeasures}
                    />
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

      {/* Bulk Edit Modal */}
      <BulkEditModal
        isOpen={showBulkEdit}
        selectedMeasures={selectedMeasures}
        songId={selectedSong?.song_id}
        selectedUser={selectedUser}
        selectedHands={selectedHands}
        onSave={handleBulkSave}
        onClose={handleBulkClose}
      />
    </div>
  )
}

export default App
