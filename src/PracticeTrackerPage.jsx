import React, { useState, useRef, useEffect } from 'react'

function PracticeTrackerPage({ pageNumber, lines, startingMeasure, measureDetails = {}, songId, onMeasureUpdate }) {
  const [selectedMeasure, setSelectedMeasure] = useState(null)
  const [confidenceInput, setConfidenceInput] = useState('')
  const [notesInput, setNotesInput] = useState('')
  const [practicerInput, setPracticerInput] = useState('')
  const [bpmInput, setBpmInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [measureHistory, setMeasureHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const confidenceInputRef = useRef(null)
  let currentMeasure = startingMeasure

  // Focus confidence input when popup opens
  useEffect(() => {
    if (selectedMeasure && confidenceInputRef.current) {
      // Small delay to ensure the popup is fully rendered
      const timer = setTimeout(() => {
        confidenceInputRef.current.focus()
        // Select all text if there's existing data for easy replacement
        if (confidenceInput) {
          confidenceInputRef.current.select()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [selectedMeasure])

  const getConfidenceStyle = (pageNum, lineNum, measureNum) => {
    const key = `${pageNum}-${lineNum}-${measureNum}`
    const details = measureDetails[key]
    
    if (!details) return {}
    
    const confidence = details.confidence
    
    // Create traffic light gradient: red (0) → yellow (5) → green #00bb00 (10)
    let red, green, blue
    
    if (confidence <= 5) {
      // Red to yellow (0-5): keep red=255, increase green, blue=0
      const yellowRatio = confidence / 5
      red = 255
      green = Math.round(255 * yellowRatio)
      blue = 0
    } else {
      // Yellow to green #00bb00 (5-10): decrease red, adjust green to target, blue=0
      const greenRatio = (confidence - 5) / 5
      red = Math.round(255 * (1 - greenRatio))
      green = Math.round(255 - (255 - 187) * greenRatio) // 187 = 0xbb
      blue = 0
    }
    
    return {
      backgroundColor: `rgb(${red}, ${green}, ${blue})`,
      color: confidence <= 2 || confidence >= 8 ? 'white' : 'black',
      fontWeight: 'bold',
      cursor: 'pointer'
    }
  }

  const getMeasureContent = (pageNum, lineNum, measureNum) => {
    return measureNum
  }

  const getConfidenceRating = (pageNum, lineNum, measureNum) => {
    const key = `${pageNum}-${lineNum}-${measureNum}`
    const details = measureDetails[key]
    
    if (!details) return null
    
    if (details.confidence === 10) {
      return (
        <>
          <span style={{ opacity: 0.5 }}>{details.confidence}</span>
          <span style={{ opacity: 1 }}> ⭐</span>
        </>
      )
    }
    return details.confidence.toString()
  }

  const fetchMeasureHistory = async (pageNum, lineNum, measureNum) => {
    setIsLoadingHistory(true)
    try {
      const response = await fetch(`http://localhost:3001/api/songs/${songId}/measures/${pageNum}/${lineNum}/${measureNum}/history`)
      if (!response.ok) throw new Error('Failed to fetch measure history')
      const history = await response.json()
      setMeasureHistory(history)
    } catch (err) {
      console.warn('Failed to fetch measure history:', err.message)
      setMeasureHistory([])
    } finally {
      setIsLoadingHistory(false)
    }
  }

  const handleMeasureClick = (pageNum, lineNum, measureNum) => {
    const key = `${pageNum}-${lineNum}-${measureNum}`
    const details = measureDetails[key]
    
    if (details) {
      // Existing measure with details - pre-populate form
      setSelectedMeasure(details)
      setConfidenceInput(details.confidence.toString())
      setNotesInput(details.notes || '')
      setPracticerInput(details.practicer || 'User')
      setBpmInput(details.bpm ? details.bpm.toString() : '')
    } else {
      // New measure without details - empty form
      setSelectedMeasure({
        page: pageNum,
        line: lineNum,
        measure: measureNum,
        confidence: null,
        notes: null,
        practicer: null,
        bpm: null,
        time: null
      })
      setConfidenceInput('')
      setNotesInput('')
      setPracticerInput('User')
      setBpmInput('')
    }

    // Fetch history for this measure
    fetchMeasureHistory(pageNum, lineNum, measureNum)
    setShowHistory(false) // Reset history expansion state
  }

  const handleKeyDown = (e) => {
    // Handle Enter key for regular inputs, Ctrl+Enter or Shift+Enter for textarea
    if (e.key === 'Enter') {
      if (e.target.tagName === 'TEXTAREA') {
        // For textarea, only save on Ctrl+Enter or Shift+Enter to allow normal line breaks
        if (e.ctrlKey || e.shiftKey) {
          e.preventDefault()
          handleSave()
        }
      } else {
        // For regular inputs, save on Enter
        e.preventDefault()
        handleSave()
      }
    }
  }

  const handleSave = async () => {
    if (!songId || !selectedMeasure) return
    
    const confidence = parseFloat(confidenceInput)
    if (isNaN(confidence) || confidence < 0 || confidence > 10) {
      alert('Please enter a confidence level between 0 and 10')
      return
    }
    
    setIsSaving(true)
    try {
      const response = await fetch(`http://localhost:3001/api/songs/${songId}/measures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          page_number: selectedMeasure.page,
          line_number: selectedMeasure.line,
          measure_number: selectedMeasure.measure,
          confidence: confidence,
          notes: notesInput.trim() || '',
          practicer: practicerInput.trim() || 'User',
          bpm: bpmInput.trim() ? parseFloat(bpmInput.trim()) : null
        })
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save measure')
      }
      
      const savedMeasure = await response.json()
      
      // Notify parent component to update measure details
      if (onMeasureUpdate) {
        onMeasureUpdate(savedMeasure)
      }
      
      closePopup()
    } catch (error) {
      console.error('Error saving measure:', error)
      alert('Failed to save confidence level: ' + error.message)
    } finally {
      setIsSaving(false)
    }
  }
  
  const closePopup = () => {
    setSelectedMeasure(null)
    setConfidenceInput('')
    setNotesInput('')
    setPracticerInput('')
    setBpmInput('')
    setIsSaving(false)
    setMeasureHistory([])
    setShowHistory(false)
    setIsLoadingHistory(false)
  }

  return (
    <div className="page">
      <div className="page-header">p{pageNumber}</div>
      
      {lines.map((numMeasures, lineIndex) => {
        const lineNumber = lineIndex + 1
        const measuresForThisLine = []
        for (let i = 0; i < numMeasures; i++) {
          measuresForThisLine.push(currentMeasure + i)
        }
        currentMeasure += numMeasures

        return (
          <div key={lineIndex} className="line-container">
            <div className="measure-row">
              {measuresForThisLine.map(measureNumber => {
                const confidenceRating = getConfidenceRating(pageNumber, lineNumber, measureNumber)
                return (
                  <div 
                    key={measureNumber} 
                    className="measure"
                    style={{
                      ...getConfidenceStyle(pageNumber, lineNumber, measureNumber),
                      position: 'relative'
                    }}
                    onClick={() => handleMeasureClick(pageNumber, lineNumber, measureNumber)}
                  >
                    <span>{getMeasureContent(pageNumber, lineNumber, measureNumber)}</span>
                    {confidenceRating && (
                      <span style={{
                        position: 'absolute',
                        top: '2px',
                        right: '4px',
                        fontSize: '10px',
                        fontWeight: 'bold',
                        opacity: typeof confidenceRating === 'string' ? 0.5 : 1
                      }}>
                        {confidenceRating}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      
      {/* Measure Details Popup */}
      {selectedMeasure && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Measure {selectedMeasure.measure} - {selectedMeasure.confidence !== null ? 'Edit' : 'Add'} Confidence</h3>
              <button className="popup-close" onClick={closePopup}>×</button>
            </div>
            <div className="popup-body">
              <div className="detail-item">
                <label>Page:</label>
                <span>{selectedMeasure.page}</span>
              </div>
              <div className="detail-item">
                <label>Line:</label>
                <span>{selectedMeasure.line}</span>
              </div>
              
              {/* Always show editable form */}
              <div className="detail-item">
                <label>Confidence Level (0-10):</label>
                <input
                  ref={confidenceInputRef}
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={confidenceInput}
                  onChange={(e) => setConfidenceInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. 7.5"
                  style={{ padding: '5px', marginLeft: '10px', width: '80px' }}
                />
              </div>
              <div className="detail-item">
                <label>Practiced By:</label>
                <input
                  type="text"
                  value={practicerInput}
                  onChange={(e) => setPracticerInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Your name"
                  style={{ padding: '5px', marginLeft: '10px', width: '150px' }}
                />
              </div>
              <div className="detail-item">
                <label>BPM (optional):</label>
                <input
                  type="number"
                  min="1"
                  max="300"
                  step="1"
                  value={bpmInput}
                  onChange={(e) => setBpmInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="e.g. 120"
                  style={{ padding: '5px', marginLeft: '10px', width: '80px' }}
                />
              </div>
              <div className="detail-item notes">
                <label>Notes (optional):</label>
                <textarea
                  value={notesInput}
                  onChange={(e) => setNotesInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Practice notes... (Ctrl+Enter or Shift+Enter to save)"
                  rows="3"
                  style={{ 
                    padding: '5px', 
                    marginTop: '5px', 
                    width: '100%', 
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>
              
              {/* Show last updated info for existing measures */}
              {selectedMeasure.time && (
                <div className="detail-item">
                  <label>Last Updated:</label>
                  <span>{new Date(selectedMeasure.time).toLocaleString()}</span>
                </div>
              )}

              {/* History section */}
              {measureHistory.length > 0 && (
                <div className="detail-item history-section">
                  <div 
                    className="history-header"
                    onClick={() => setShowHistory(!showHistory)}
                    style={{
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '5px 0',
                      borderTop: '1px solid #eee',
                      marginTop: '10px',
                      paddingTop: '10px'
                    }}
                  >
                    <label style={{ margin: 0, cursor: 'pointer' }}>History ({measureHistory.length} changes)</label>
                    <span style={{ 
                      transform: showHistory ? 'rotate(90deg)' : 'rotate(0deg)',
                      transition: 'transform 0.2s ease',
                      fontSize: '12px'
                    }}>
                      ▶
                    </span>
                  </div>
                  
                  {showHistory && (
                    <div className="history-content" style={{ 
                      marginTop: '10px', 
                      marginLeft: '15px',
                      marginRight: '15px',
                      maxHeight: '200px', 
                      overflowY: 'auto',
                      width: 'calc(100% - 30px)'
                    }}>
                      {isLoadingHistory ? (
                        <div style={{ padding: '10px', fontStyle: 'italic', color: '#666' }}>Loading history...</div>
                      ) : (
                        measureHistory.map((historyItem, index) => (
                          <div 
                            key={`${historyItem.song_measure_id}-${historyItem.archived_at}`}
                            style={{
                              padding: '8px',
                              marginBottom: '8px',
                              backgroundColor: '#f9f9f9',
                              borderRadius: '4px',
                              fontSize: '14px',
                              border: '1px solid #e0e0e0',
                              width: '100%',
                              boxSizing: 'border-box'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                              <strong>Confidence: {historyItem.confidence}</strong>
                              <span style={{ 
                                fontSize: '12px', 
                                color: '#666',
                                whiteSpace: 'nowrap',
                                marginLeft: '10px',
                                textAlign: 'right'
                              }}>
                                {new Date(historyItem.archived_at).toLocaleString()}
                              </span>
                            </div>
                            {historyItem.notes && (
                              <div style={{ marginBottom: '4px', fontSize: '13px' }}>
                                <strong>Notes:</strong> {historyItem.notes}
                              </div>
                            )}
                            <div style={{ fontSize: '12px', color: '#666', display: 'flex', justifyContent: 'space-between' }}>
                              <span>By: {historyItem.practicer || 'Unknown'}</span>
                              {historyItem.bpm && (
                                <span>BPM: {historyItem.bpm}</span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <div className="popup-buttons">
                <button 
                  onClick={handleSave} 
                  disabled={isSaving || !confidenceInput.trim()}
                  style={{
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: isSaving || !confidenceInput.trim() ? 'not-allowed' : 'pointer',
                    marginRight: '8px',
                    opacity: isSaving || !confidenceInput.trim() ? 0.6 : 1
                  }}
                >
                  {isSaving ? 'Saving...' : selectedMeasure.confidence !== null ? 'Update' : 'Save'}
                </button>
                <button 
                  onClick={closePopup}
                  style={{
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PracticeTrackerPage