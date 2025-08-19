import React, { useState, useRef, useEffect } from 'react'

function EditMeasureDetailsModal({ 
  isOpen, 
  onClose, 
  selectedMeasure, 
  songId, 
  selectedUser, 
  onSave 
}) {
  const [confidenceInput, setConfidenceInput] = useState('')
  const [notesInput, setNotesInput] = useState('')
  const [practicerInput, setPracticerInput] = useState('')
  const [bpmInput, setBpmInput] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [measureHistory, setMeasureHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showPracticerSelection, setShowPracticerSelection] = useState(false)
  const [selectedPracticerData, setSelectedPracticerData] = useState(null)
  const confidenceInputRef = useRef(null)

  // Focus confidence input when popup opens and form is ready
  useEffect(() => {
    if (!showPracticerSelection && selectedMeasure && confidenceInputRef.current) {
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
  }, [showPracticerSelection, selectedMeasure])

  // Initialize form data when selectedMeasure changes
  useEffect(() => {
    if (selectedMeasure) {
      // Check if this is a multi-practitioner measure
      if (selectedMeasure.practitionerData && selectedMeasure.practitionerData.length > 1) {
        setShowPracticerSelection(true)
        setSelectedPracticerData(null)
      } else if (selectedMeasure.practitionerData && selectedMeasure.practitionerData.length === 1) {
        // Single practitioner - use their data
        const practitionerData = selectedMeasure.practitionerData[0]
        setShowPracticerSelection(false)
        setSelectedPracticerData(practitionerData)
        setConfidenceInput(practitionerData.confidence.toString())
        setNotesInput(practitionerData.notes || '')
        setPracticerInput(practitionerData.practicer || 'User')
        setBpmInput(practitionerData.bpm ? practitionerData.bpm.toString() : '')
      } else {
        // New measure without details - use defaults
        setShowPracticerSelection(false)
        setSelectedPracticerData(null)
        setConfidenceInput('')
        setNotesInput('')
        setPracticerInput(selectedUser || '')
        setBpmInput('')
      }
      
      // Fetch history for this measure
      fetchMeasureHistory(selectedMeasure.page, selectedMeasure.line, selectedMeasure.measure)
      setShowHistory(false) // Reset history expansion state
    }
  }, [selectedMeasure, selectedUser])

  const fetchMeasureHistory = async (pageNum, lineNum, measureNum) => {
    setIsLoadingHistory(true)
    try {
      // Build URL with optional practicer filter
      let url = `http://localhost:3001/api/songs/${songId}/measures/${pageNum}/${lineNum}/${measureNum}/history`
      if (selectedUser) {
        url += `?practicer=${encodeURIComponent(selectedUser)}`
      }
      
      const response = await fetch(url)
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

  const handleKeyDown = (e) => {
    // Handle Enter key for regular inputs, Ctrl+Enter or Shift+Enter for textarea
    if (e.key === 'Enter') {
      if (e.target.tagName === 'TEXTAREA') {
        // For textarea, only save on Ctrl+Enter or Shift+Enter
        if (e.ctrlKey || e.shiftKey) {
          e.preventDefault()
          handleSave()
        }
        // Otherwise let the textarea handle the Enter normally (new line)
      } else {
        // For regular inputs, Enter saves
        e.preventDefault()
        handleSave()
      }
    } else if (e.key === 'Escape') {
      handleClose()
    }
  }

  const handleSave = async () => {
    if (!songId || !selectedMeasure) return
    
    const confidence = parseFloat(confidenceInput)
    if (isNaN(confidence) || confidence < 0 || confidence > 10) {
      alert('Please enter a confidence level between 0 and 10')
      return
    }
    
    if (!practicerInput.trim()) {
      alert('Please enter a practicer name')
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
      onSave(savedMeasure)
      handleClose()
    } catch (err) {
      alert(`Error saving measure: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }
  
  const handlePracticerSelect = (practitionerData) => {
    setSelectedPracticerData(practitionerData)
    setShowPracticerSelection(false)
    setConfidenceInput(practitionerData.confidence.toString())
    setNotesInput(practitionerData.notes || '')
    setPracticerInput(practitionerData.practicer || 'User')
    setBpmInput(practitionerData.bpm ? practitionerData.bpm.toString() : '')
  }

  const handleAddNewPractitioner = () => {
    setSelectedPracticerData(null)
    setShowPracticerSelection(false)
    setConfidenceInput('')
    setNotesInput('')
    setPracticerInput(selectedUser || '')
    setBpmInput('')
  }

  const handleClose = () => {
    setConfidenceInput('')
    setNotesInput('')
    setPracticerInput('')
    setBpmInput('')
    setIsSaving(false)
    setMeasureHistory([])
    setShowHistory(false)
    setIsLoadingHistory(false)
    setShowPracticerSelection(false)
    setSelectedPracticerData(null)
    onClose()
  }

  if (!isOpen || !selectedMeasure) return null

  return (
    <div className="popup-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="popup-content">
        <div className="popup-header">
          <h3>
            Page {selectedMeasure.page}, Line {selectedMeasure.line}, Measure {selectedMeasure.measure}
          </h3>
          <button className="popup-close" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="popup-body">
          {showPracticerSelection ? (
            <div className="practitioner-selection">
              <h4>Multiple practitioners found. Choose one to view/edit:</h4>
              <div style={{ marginTop: '15px' }}>
                {selectedMeasure.practitionerData.map((practitionerData, index) => (
                  <div 
                    key={index}
                    style={{
                      padding: '10px',
                      margin: '5px 0',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: '#f9f9f9'
                    }}
                    onClick={() => handlePracticerSelect(practitionerData)}
                  >
                    <strong>{practitionerData.practicer}</strong> - Confidence: {practitionerData.confidence}
                    {practitionerData.bpm && <span> - BPM: {practitionerData.bpm}</span>}
                    <br />
                    <small style={{ color: '#666' }}>
                      Last updated: {new Date(practitionerData.time).toLocaleString()}
                    </small>
                    {practitionerData.notes && (
                      <div style={{ marginTop: '5px', fontSize: '13px', fontStyle: 'italic' }}>
                        "{practitionerData.notes}"
                      </div>
                    )}
                  </div>
                ))}
                <button 
                  onClick={handleAddNewPractitioner}
                  style={{
                    marginTop: '10px',
                    padding: '10px 15px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  + Add New Practitioner
                </button>
              </div>
            </div>
          ) : (
            <div className="measure-edit-form">
          <div className="detail-item">
            <label>Confidence (0-10):</label>
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
              placeholder="Practice notes, observations, etc."
              style={{
                padding: '8px',
                marginTop: '5px',
                width: '100%',
                minHeight: '80px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>
          
          {/* Show last updated info for existing measures */}
          {selectedPracticerData && selectedPracticerData.time && (
            <div className="detail-item">
              <label>Last Updated:</label>
              <span>{new Date(selectedPracticerData.time).toLocaleString()}</span>
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
            </div>
          )}
          
          <div className="popup-buttons">
            <button 
              onClick={handleSave} 
              disabled={isSaving || !confidenceInput.trim()}
              style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSaving || !confidenceInput.trim() ? 'not-allowed' : 'pointer',
                opacity: isSaving || !confidenceInput.trim() ? 0.6 : 1
              }}
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={handleClose}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                marginLeft: '8px'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EditMeasureDetailsModal