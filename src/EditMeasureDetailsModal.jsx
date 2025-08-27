import React, { useState, useRef, useEffect } from 'react'
import { API_BASE } from './config'

function EditMeasureDetailsModal({ 
  isOpen, 
  onClose, 
  selectedMeasure, 
  songId, 
  selectedUser, 
  selectedHands,
  selectedBpm,
  onSave,
  userMeasureDetails,
  onHideToMemorizeToggle
}) {
  const [confidenceInput, setConfidenceInput] = useState('')
  const [notesInput, setNotesInput] = useState('')
  const [practicerInput, setPracticerInput] = useState('')
  const [bpmInput, setBpmInput] = useState('')
  const [handsInput, setHandsInput] = useState('both')
  const [isSaving, setIsSaving] = useState(false)
  const [measureHistory, setMeasureHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [showRecordSelection, setShowRecordSelection] = useState(false)
  const [selectedRecordData, setSelectedRecordData] = useState(null)
  const confidenceInputRef = useRef(null)

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  // Focus confidence input when popup opens and form is ready
  useEffect(() => {
    if (!showRecordSelection && selectedMeasure && confidenceInputRef.current) {
      // Small delay to ensure the popup is fully rendered
      const timer = setTimeout(() => {
        confidenceInputRef.current.focus()
        // Select all text if there's existing data for easy replacement
        confidenceInputRef.current.select()
      }, 100)
      return () => {
        clearTimeout(timer)
      }
    }
  }, [showRecordSelection, selectedMeasure, isOpen])

  // Initialize form data when selectedMeasure changes
  useEffect(() => {
    if (selectedMeasure) {
      // Check if this is a multi-record measure
      if (selectedMeasure.measureDetailsRecords && selectedMeasure.measureDetailsRecords.length > 1) {
        setShowRecordSelection(true)
        setSelectedRecordData(null)
      } else if (selectedMeasure.measureDetailsRecords && selectedMeasure.measureDetailsRecords.length === 1) {
        // Single record - use its data
        const recordData = selectedMeasure.measureDetailsRecords[0]
        setShowRecordSelection(false)
        setSelectedRecordData(recordData)
        setConfidenceInput(recordData.confidence.toString())
        setNotesInput(recordData.notes || '')
        setPracticerInput(recordData.practicer || 'User')
        setBpmInput(recordData.bpm ? recordData.bpm.toString() : '')
        setHandsInput(recordData.hands || 'both')
        // Fetch history for this specific record
        fetchMeasureHistory(selectedMeasure.page, selectedMeasure.line, selectedMeasure.measure, recordData.practicer, recordData.hands)
      } else {
        // New measure without details - use defaults
        setShowRecordSelection(false)
        setSelectedRecordData(null)
        setConfidenceInput('')
        setNotesInput('')
        setPracticerInput(selectedUser || '')
        setBpmInput(selectedBpm || '')
        setHandsInput(selectedHands || 'both')
      }
      
      // Reset history state - don't fetch until record is selected
      setMeasureHistory([])
      setShowHistory(false)
    }
  }, [selectedMeasure, selectedUser, selectedHands])

  const fetchMeasureHistory = async (pageNum, lineNum, measureNum, practicer = null, hands = null) => {
    setIsLoadingHistory(true)
    try {
      // Build URL with specific practicer and hands filters
      let url = `${API_BASE}/songs/${songId}/measures/${pageNum}/${lineNum}/${measureNum}/history`
      const params = new URLSearchParams()
      
      if (practicer) {
        params.append('practicer', practicer)
      }
      if (hands) {
        params.append('hands', hands)
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`
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
      const response = await fetch(`${API_BASE}/songs/${songId}/measures`, {
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
          bpm: bpmInput.trim() ? parseFloat(bpmInput.trim()) : null,
          hands: handsInput
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
  
  const handleRecordSelect = (recordData) => {
    setSelectedRecordData(recordData)
    setShowRecordSelection(false)
    setConfidenceInput(recordData.confidence.toString())
    setNotesInput(recordData.notes || '')
    setPracticerInput(recordData.practicer || 'User')
    setBpmInput(recordData.bpm ? recordData.bpm.toString() : '')
    setHandsInput(recordData.hands || 'both')
    // Fetch history for this specific record
    fetchMeasureHistory(selectedMeasure.page, selectedMeasure.line, selectedMeasure.measure, recordData.practicer, recordData.hands)
  }

  const handleAddNewRecord = () => {
    setSelectedRecordData(null)
    setShowRecordSelection(false)
    setConfidenceInput('')
    setNotesInput('')
    setPracticerInput(selectedUser || '')
    setBpmInput(selectedBpm || '')
    setHandsInput(selectedHands || 'both')
  }

  const handleHideToMemorizeToggle = async () => {
    if (!selectedMeasure || !onHideToMemorizeToggle || !selectedUser) return
    
    const measureKey = `${selectedMeasure.page}-${selectedMeasure.line}-${selectedMeasure.measure}`
    const newHideState = !userMeasureDetails[measureKey]?.hideToMemorize
    
    try {
      await onHideToMemorizeToggle(selectedMeasure.page, selectedMeasure.line, selectedMeasure.measure, newHideState)
    } catch (error) {
      console.error('Failed to toggle hide to memorize:', error)
      // Could show user-friendly error here if needed
    }
  }

  const handleClose = () => {
    setConfidenceInput('')
    setNotesInput('')
    setPracticerInput('')
    setBpmInput('')
    setHandsInput(selectedHands || 'both')
    setIsSaving(false)
    setMeasureHistory([])
    setShowHistory(false)
    setIsLoadingHistory(false)
    setShowRecordSelection(false)
    setSelectedRecordData(null)
    onClose()
  }

  if (!isOpen || !selectedMeasure) return null

  return (
    <div className="popup-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="popup-content">
        <div className="popup-header">
          <h3>
            {!showRecordSelection && selectedMeasure.measureDetailsRecords && selectedMeasure.measureDetailsRecords.length > 1 && (
              <span 
                onClick={() => {
                  setShowRecordSelection(true)
                  setSelectedRecordData(null)
                  setMeasureHistory([])
                  setShowHistory(false)
                }}
                className="back-arrow"
                title="Back to record selection"
              >
                ← 
              </span>
            )}
            Page {selectedMeasure.page}, Line {selectedMeasure.line}, Measure {selectedMeasure.measure}
          </h3>
          
          {/* Hide to memorize toggle */}
          <div style={{ 
            marginTop: '10px', 
            paddingBottom: '10px', 
            borderBottom: '1px solid #eee',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            opacity: !selectedUser ? 0.5 : 1
          }}>
            <label className="checkbox-label" style={{ 
              cursor: !selectedUser ? 'not-allowed' : 'pointer'
            }}>
              <input
                type="checkbox"
                checked={selectedUser ? userMeasureDetails[`${selectedMeasure.page}-${selectedMeasure.line}-${selectedMeasure.measure}`]?.hideToMemorize || false : false}
                onChange={handleHideToMemorizeToggle}
                disabled={!selectedUser}
              />
              🙈 Hide for memorization practice {!selectedUser && <span style={{ fontSize: '12px', color: '#888' }}>(select a user first)</span>}
            </label>
          </div>
          <button className="popup-close" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="popup-body">
          {showRecordSelection ? (
            <div className="record-selection">
              <h4>Multiple records found. Choose one to view/edit:</h4>
              <div style={{ marginTop: '15px' }}>
                {selectedMeasure.measureDetailsRecords.map((recordData, index) => (
                  <div 
                    key={index}
                    className="record-item"
                    onClick={() => handleRecordSelect(recordData)}
                  >
                    <strong>{recordData.practicer}</strong> - Confidence: {recordData.confidence}
                    {recordData.bpm && <span> - BPM: {recordData.bpm}</span>}
                    {recordData.hands && <span> - Hands: {recordData.hands}</span>}
                    <br />
                    <small className="record-item-timestamp">
                      Last updated: {new Date(recordData.time).toLocaleString()}
                    </small>
                    {recordData.notes && (
                      <div className="record-item-notes">
                        "{recordData.notes}"
                      </div>
                    )}
                  </div>
                ))}
                <button 
                  onClick={handleAddNewRecord}
                  className="modal-button success"
                >
                  + Add New Record
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
              className="form-input small"
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
              className="form-input large"
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
              className="form-input small"
            />
          </div>
          <div className="detail-item">
            <label>Hands:</label>
            <select
              value={handsInput}
              onChange={(e) => setHandsInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="form-input medium"
            >
              <option value="both">Both</option>
              <option value="right">Right</option>
              <option value="left">Left</option>
            </select>
          </div>
          <div className="detail-item notes">
            <label>Notes (optional):</label>
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Practice notes, observations, etc."
              className="notes-textarea"
            />
          </div>
          
          {/* Show last updated info for existing measures */}
          {selectedRecordData && selectedRecordData.time && (
            <div className="detail-item">
              <label>Last Updated:</label>
              <span>{new Date(selectedRecordData.time).toLocaleString()}</span>
            </div>
          )}

          {/* History section */}
          {measureHistory.length > 0 && (
            <div className="detail-item history-section">
              <div 
                className="history-header"
                onClick={() => setShowHistory(!showHistory)}
              >
                <label style={{ margin: 0, cursor: 'pointer' }}>
                  History ({measureHistory.length} changes)
                  <span className={`history-arrow ${showHistory ? 'expanded' : ''}`}>
                    ▶
                  </span>
                </label>
              </div>
              
              {showHistory && (
                <div className="history-content">
                  {isLoadingHistory ? (
                    <div style={{ padding: '10px', fontStyle: 'italic', color: '#666' }}>Loading history...</div>
                  ) : (
                    measureHistory.map((historyItem, index) => (
                      <div 
                        key={`${historyItem.measure_confidence_id}-${historyItem.archived_at}`}
                        className="history-item"
                      >
                        <div className="history-item-header">
                          <strong>Confidence: {historyItem.confidence}</strong>
                          <span className="history-item-timestamp">
                            {new Date(historyItem.archived_at).toLocaleString()}
                          </span>
                        </div>
                        {historyItem.notes && (
                          <div className="history-item-notes">
                            <strong>Notes:</strong> {historyItem.notes}
                          </div>
                        )}
                        <div className="history-item-footer">
                          <span>By: {historyItem.practicer || 'Unknown'}</span>
                          <div>
                            {historyItem.bpm && <span>BPM: {historyItem.bpm}</span>}
                            {historyItem.bpm && historyItem.hands && <span> • </span>}
                            {historyItem.hands && <span>Hands: {historyItem.hands}</span>}
                          </div>
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
              className="modal-button primary"
            >
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={handleClose}
              className="modal-button secondary"
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