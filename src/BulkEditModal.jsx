import React, { useState, useRef, useEffect } from 'react'

function BulkEditModal({ 
  isOpen, 
  onClose, 
  selectedMeasures, 
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
  const confidenceInputRef = useRef(null)
  const hideToMemorizeCheckboxRef = useRef(null)

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

  // Focus confidence input when popup opens
  useEffect(() => {
    if (isOpen && confidenceInputRef.current) {
      const timer = setTimeout(() => {
        confidenceInputRef.current.focus()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      setConfidenceInput('')
      setNotesInput('')
      setPracticerInput(selectedUser || '')
      setBpmInput(selectedBpm || '')
      setHandsInput(selectedHands || 'both')
    }
  }, [isOpen, selectedUser, selectedHands, selectedBpm])

  // Calculate and update tri-state checkbox for hide_to_memorize
  useEffect(() => {
    if (isOpen && hideToMemorizeCheckboxRef.current) {
      // Count how many selected measures are hidden
      const measureList = Array.from(selectedMeasures)
      const hiddenCount = measureList.filter(measureKey => 
        userMeasureDetails[measureKey]?.hideToMemorize
      ).length
      
      const checkbox = hideToMemorizeCheckboxRef.current
      
      if (hiddenCount === 0) {
        // None hidden - unchecked
        checkbox.checked = false
        checkbox.indeterminate = false
      } else if (hiddenCount === measureList.length) {
        // All hidden - checked
        checkbox.checked = true
        checkbox.indeterminate = false
      } else {
        // Some hidden - indeterminate
        checkbox.checked = false
        checkbox.indeterminate = true
      }
    }
  }, [isOpen, selectedMeasures, userMeasureDetails])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (e.target.tagName === 'TEXTAREA') {
        if (e.ctrlKey || e.shiftKey) {
          e.preventDefault()
          handleSave()
        }
      } else {
        e.preventDefault()
        handleSave()
      }
    } else if (e.key === 'Escape') {
      handleClose()
    }
  }

  const handleSave = async () => {
    if (!songId || selectedMeasures.size === 0) return
    
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
      // Convert selectedMeasures Set to array and parse measure coordinates
      const measureList = Array.from(selectedMeasures).map(measureKey => {
        const [page, line, measure] = measureKey.split('-').map(Number)
        return { page, line, measure }
      })

      // Save each measure individually
      const savedMeasures = []
      for (const { page, line, measure } of measureList) {
        const response = await fetch(`http://localhost:3001/api/songs/${songId}/measures`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page_number: page,
            line_number: line,
            measure_number: measure,
            confidence: confidence,
            notes: notesInput.trim() || '',
            practicer: practicerInput.trim() || 'User',
            bpm: bpmInput.trim() ? parseFloat(bpmInput.trim()) : null,
            hands: handsInput
          })
        })
        
        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || `Failed to save measure ${page}-${line}-${measure}`)
        }
        
        const savedMeasure = await response.json()
        savedMeasures.push(savedMeasure)
      }
      
      // Notify parent of all saved measures
      savedMeasures.forEach(measure => onSave(measure))
      handleClose()
    } catch (err) {
      alert(`Error saving measures: ${err.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleBulkHideToMemorizeToggle = async () => {
    if (!selectedUser) return
    
    // Calculate current state
    const measureList = Array.from(selectedMeasures)
    const hiddenCount = measureList.filter(measureKey => 
      userMeasureDetails[measureKey]?.hideToMemorize
    ).length
    
    // Determine target state based on tri-state logic
    let targetHideState
    if (hiddenCount === 0) {
      // None hidden → hide all
      targetHideState = true
    } else if (hiddenCount === measureList.length) {
      // All hidden → show all
      targetHideState = false
    } else {
      // Mixed state → hide all (consistent with most UIs)
      targetHideState = true
    }
    
    // Apply to all selected measures
    for (const measureKey of measureList) {
      const [page, line, measure] = measureKey.split('-').map(Number)
      try {
        await onHideToMemorizeToggle(page, line, measure, targetHideState)
      } catch (error) {
        console.error(`Failed to toggle hide_to_memorize for measure ${measureKey}:`, error)
      }
    }
  }

  const handleClose = () => {
    setConfidenceInput('')
    setNotesInput('')
    setPracticerInput('')
    setBpmInput('')
    setHandsInput(selectedHands || 'both')
    setIsSaving(false)
    onClose()
  }

  if (!isOpen) return null

  // Parse selected measures for display
  const measureList = Array.from(selectedMeasures).map(measureKey => {
    const [page, line, measure] = measureKey.split('-').map(Number)
    return { page, line, measure, key: measureKey }
  }).sort((a, b) => {
    if (a.page !== b.page) return a.page - b.page
    if (a.line !== b.line) return a.line - b.line
    return a.measure - b.measure
  })

  return (
    <div className="popup-overlay" onClick={(e) => e.target === e.currentTarget && handleClose()}>
      <div className="popup-content">
        <div className="popup-header">
          <h3>Bulk Edit {selectedMeasures.size} Measures</h3>
          <button className="popup-close" onClick={handleClose}>
            ×
          </button>
        </div>
        
        <div className="popup-body">
          {/* Selected measures summary */}
          <div className="measures-summary">
            <h4 className="measures-summary-header">Selected Measures:</h4>
            <div className="measures-summary-content">
              {measureList.map((m, index) => (
                <span key={m.key}>
                  {index > 0 && ', '}
                  p{m.page}L{m.line}M{m.measure}
                </span>
              ))}
            </div>
          </div>

          {/* Hide to memorize toggle */}
          <div style={{ 
            marginTop: '15px',
            marginBottom: '15px', 
            paddingBottom: '15px', 
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
                ref={hideToMemorizeCheckboxRef}
                type="checkbox"
                onChange={handleBulkHideToMemorizeToggle}
                disabled={!selectedUser}
              />
              🙈 Hide for memorization practice {!selectedUser && <span style={{ fontSize: '12px', color: '#888' }}>(select a user first)</span>}
            </label>
          </div>

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
          </div>
          
          <div className="popup-buttons">
            <button 
              onClick={handleSave} 
              disabled={isSaving || !confidenceInput.trim()}
              className="modal-button primary"
            >
              {isSaving ? 'Saving...' : `Save to ${selectedMeasures.size} Measures`}
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

export default BulkEditModal