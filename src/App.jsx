import React, { useState, useEffect } from 'react'
import './App.css'
import PracticeTrackerPage from './PracticeTrackerPage'

function App() {
  const [songs, setSongs] = useState([])
  const [selectedSong, setSelectedSong] = useState(null)
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const API_BASE = 'http://localhost:3001/api'

  useEffect(() => {
    fetchSongs()
  }, [])

  useEffect(() => {
    if (selectedSong) {
      fetchPages(selectedSong.song_id)
    }
  }, [selectedSong])

  const fetchSongs = async () => {
    try {
      const response = await fetch(`${API_BASE}/songs`)
      if (!response.ok) throw new Error('Failed to fetch songs')
      const songsData = await response.json()
      setSongs(songsData)
      
      // Auto-select Köln Concert Part I if available
      const kolnConcert = songsData.find(song => 
        song.title.includes('Köln') && song.title.includes('Part I')
      )
      if (kolnConcert) {
        setSelectedSong(kolnConcert)
      } else if (songsData.length > 0) {
        setSelectedSong(songsData[0])
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchPages = async (songId) => {
    try {
      const response = await fetch(`${API_BASE}/songs/${songId}/pages`)
      if (!response.ok) throw new Error('Failed to fetch pages')
      const pagesData = await response.json()
      setPages(pagesData)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="container">Loading...</div>
  if (error) return <div className="container">Error: {error}</div>

  return (
    <div className="container">
      <div className="song-selector">
        <label htmlFor="song-select">Song: </label>
        <select 
          id="song-select"
          value={selectedSong?.song_id || ''} 
          onChange={(e) => {
            const song = songs.find(s => s.song_id === parseInt(e.target.value))
            setSelectedSong(song)
          }}
        >
          {songs.map(song => (
            <option key={song.song_id} value={song.song_id}>
              {song.title} - {song.artist}
            </option>
          ))}
        </select>
      </div>

      {selectedSong && (
        <div className="song-info">
          <h2>{selectedSong.title}</h2>
          <p>by {selectedSong.artist} ({selectedSong.year})</p>
        </div>
      )}

      {pages.length > 0 ? (
        <div className="pages-grid">
          {pages.reduce((result, page, index) => {
            if (index % 2 === 0) {
              result.push(
                <div key={`row-${index}`} className="pages-container">
                  <PracticeTrackerPage {...page} songId={selectedSong?.song_id} />
                  {pages[index + 1] && (
                    <PracticeTrackerPage {...pages[index + 1]} songId={selectedSong?.song_id} />
                  )}
                </div>
              )
            }
            return result
          }, [])}
        </div>
      ) : (
        <div>No pages found for this song</div>
      )}
    </div>
  )
}

export default App
