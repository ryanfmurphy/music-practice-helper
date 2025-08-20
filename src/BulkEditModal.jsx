import React, { useState, useRef, useEffect } from 'react'

function BulkEditModal({ 
  isOpen, 
  onClose, 
  selectedMeasures, 
  songId, 
  selectedUser, 
  selectedHands,
  onSave 
}) {
  const [confidenceInput, setConfidenceInput] = useState('')
  const [notesInput, setNotesInput] = useState('')
  const [practicerInput, setPracticerInput] = useState('')
  const [bpmInput, setBpmInput] = useState('')
  const [handsInput, setHandsInput] = useState('both')
  const [isSaving, setIsSaving] = useState(false)
  const confidenceInputRef = useRef(null)

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
      setBpmInput('')
      setHandsInput(selectedHands || 'both')
    }
  }, [isOpen, selectedUser, selectedHands])

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
          <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>Selected Measures:</h4>
            <div style={{ fontSize: '12px', color: '#666', maxHeight: '80px', overflowY: 'auto' }}>
              {measureList.map((m, index) => (
                <span key={m.key}>
                  {index > 0 && ', '}
                  p{m.page}L{m.line}M{m.measure}
                </span>
              ))}
            </div>
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
            <div className="detail-item">
              <label>Hands:</label>
              <select
                value={handsInput}
                onChange={(e) => setHandsInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ padding: '5px', marginLeft: '10px', width: '120px' }}
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
          </div>
          
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
              {isSaving ? 'Saving...' : `Save to ${selectedMeasures.size} Measures`}
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

export default BulkEditModal