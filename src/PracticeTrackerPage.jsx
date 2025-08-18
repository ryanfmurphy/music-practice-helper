import React, { useState } from 'react'

function PracticeTrackerPage({ pageNumber, lines, startingMeasure, measureDetails = {}, songId, onMeasureUpdate }) {
  const [selectedMeasure, setSelectedMeasure] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [confidenceInput, setConfidenceInput] = useState('')
  const [notesInput, setNotesInput] = useState('')
  const [practicerInput, setPracticerInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  let currentMeasure = startingMeasure

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

  const getConfidenceContent = (pageNum, lineNum, measureNum) => {
    const key = `${pageNum}-${lineNum}-${measureNum}`
    const details = measureDetails[key]
    
    if (!details) return measureNum
    
    if (details.confidence === 10) {
      return `${measureNum} ⭐`
    }
    return measureNum
  }

  const handleMeasureClick = (pageNum, lineNum, measureNum) => {
    const key = `${pageNum}-${lineNum}-${measureNum}`
    const details = measureDetails[key]
    
    if (details) {
      // Existing measure with details
      setSelectedMeasure(details)
      setIsEditing(false)
    } else {
      // New measure without details - show input form
      setSelectedMeasure({
        page: pageNum,
        line: lineNum,
        measure: measureNum,
        confidence: null,
        notes: null,
        practicer: null,
        time: null
      })
      setIsEditing(true)
      setConfidenceInput('')
      setNotesInput('')
      setPracticerInput('User')
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
          practicer: practicerInput.trim() || 'User'
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
    setIsEditing(false)
    setConfidenceInput('')
    setNotesInput('')
    setPracticerInput('')
    setIsSaving(false)
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
              {measuresForThisLine.map(measureNumber => (
                <div 
                  key={measureNumber} 
                  className="measure"
                  style={getConfidenceStyle(pageNumber, lineNumber, measureNumber)}
                  onClick={() => handleMeasureClick(pageNumber, lineNumber, measureNumber)}
                >
                  {getConfidenceContent(pageNumber, lineNumber, measureNumber)}
                </div>
              ))}
            </div>
          </div>
        )
      })}
      
      {/* Measure Details Popup */}
      {selectedMeasure && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-content" onClick={(e) => e.stopPropagation()}>
            <div className="popup-header">
              <h3>Measure {selectedMeasure.measure} {isEditing ? '- Add Confidence' : 'Details'}</h3>
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
              
              {isEditing ? (
                // Input form for new confidence
                <>
                  <div className="detail-item">
                    <label>Confidence Level (0-10):</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      step="0.1"
                      value={confidenceInput}
                      onChange={(e) => setConfidenceInput(e.target.value)}
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
                      placeholder="Your name"
                      style={{ padding: '5px', marginLeft: '10px', width: '150px' }}
                    />
                  </div>
                  <div className="detail-item notes">
                    <label>Notes (optional):</label>
                    <textarea
                      value={notesInput}
                      onChange={(e) => setNotesInput(e.target.value)}
                      placeholder="Practice notes..."
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
                      {isSaving ? 'Saving...' : 'Save'}
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
                </>
              ) : (
                // Display existing confidence data
                <>
                  <div className="detail-item">
                    <label>Confidence Level:</label>
                    <span className="confidence-value">
                      {selectedMeasure.confidence}/10
                      {selectedMeasure.confidence === 10 && ' ⭐'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>Practiced By:</label>
                    <span>{selectedMeasure.practicer || 'Unknown'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Last Updated:</label>
                    <span>{new Date(selectedMeasure.time).toLocaleString()}</span>
                  </div>
                  {selectedMeasure.notes && (
                    <div className="detail-item notes">
                      <label>Notes:</label>
                      <p>{selectedMeasure.notes}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PracticeTrackerPage