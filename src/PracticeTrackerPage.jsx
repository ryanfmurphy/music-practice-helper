import React, { useState } from 'react'
import EditMeasureDetailsModal from './EditMeasureDetailsModal'
import BulkEditModal from './BulkEditModal'

function PracticeTrackerPage({ pageNumber, lines, startingMeasure, measureDetails = {}, songId, selectedUser, selectedHands, onMeasureUpdate }) {
  const [selectedMeasure, setSelectedMeasure] = useState(null)
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedMeasures, setSelectedMeasures] = useState(new Set())
  const [showBulkEdit, setShowBulkEdit] = useState(false)
  let currentMeasure = startingMeasure

  const getConfidenceStyle = (pageNum, lineNum, measureNum) => {
    const key = `${pageNum}-${lineNum}-${measureNum}`
    const detailsArray = measureDetails[key]
    const measureKey = `${pageNum}-${lineNum}-${measureNum}`
    const isSelected = selectedMeasures.has(measureKey)
    
    let baseStyle = {}
    
    if (!detailsArray || detailsArray.length === 0) {
      baseStyle = {}
    } else if (detailsArray.length > 1) {
      // If multiple records, determine background color based on what varies
      const uniquePracticers = new Set(detailsArray.map(d => d.practicer))
      const uniqueHands = new Set(detailsArray.map(d => d.hands))
      
      const multiplePracticers = uniquePracticers.size > 1
      const multipleHands = uniqueHands.size > 1
      
      let backgroundColor
      if (multiplePracticers && multipleHands) {
        // Both: average between purple and cornflower blue
        backgroundColor = '#9FB0E6' // Average of #B19CD9 (purple) and #6495ED (cornflower blue)
      } else if (multipleHands) {
        // Only hands: cornflower blue
        backgroundColor = '#6495ED'
      } else {
        // Only practicers: purple
        backgroundColor = '#B19CD9'
      }
      
      baseStyle = {
        backgroundColor,
        color: 'black',
        fontWeight: 'bold'
      }
    } else {
      // Single practitioner - use normal traffic light colors
      const details = detailsArray[0]
      const confidence = details.confidence
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

      baseStyle = {
        backgroundColor: `rgb(${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)})`,
        color: 'black',
        fontWeight: 'bold'
      }
    }

    // Add selection styling if in selection mode
    if (isSelectionMode) {
      if (isSelected) {
        return {
          ...baseStyle,
          border: '3px solid #007bff',
          boxShadow: '0 0 0 1px #007bff',
          cursor: 'pointer'
        }
      } else {
        return {
          ...baseStyle,
          border: '2px solid transparent',
          cursor: 'pointer'
        }
      }
    }

    return {
      ...baseStyle,
      cursor: 'pointer'
    }
  }

  const getMeasureContent = (pageNum, lineNum, measureNum) => {
    return measureNum
  }

  const getConfidenceRating = (pageNum, lineNum, measureNum) => {
    const key = `${pageNum}-${lineNum}-${measureNum}`
    const detailsArray = measureDetails[key]
    
    if (!detailsArray || detailsArray.length === 0) return null
    
    // If multiple records, analyze what varies
    if (detailsArray.length > 1) {
      const uniquePracticers = new Set(detailsArray.map(d => d.practicer))
      const uniqueHands = new Set(detailsArray.map(d => d.hands))
      
      const multiplePracticers = uniquePracticers.size > 1
      const multipleHands = uniqueHands.size > 1
      
      if (multiplePracticers && multipleHands) {
        return '👥🙌'
      } else if (multipleHands) {
        return '🙌'
      } else {
        return '👥'
      }
    }
    
    // Single record - show confidence rating
    const details = detailsArray[0]
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

  const handleMeasureClick = (pageNum, lineNum, measureNum) => {
    if (isSelectionMode) {
      // In selection mode - toggle measure selection
      const measureKey = `${pageNum}-${lineNum}-${measureNum}`
      const newSelected = new Set(selectedMeasures)
      
      if (newSelected.has(measureKey)) {
        newSelected.delete(measureKey)
      } else {
        newSelected.add(measureKey)
      }
      
      setSelectedMeasures(newSelected)
    } else {
      // Normal mode - open edit modal
      const key = `${pageNum}-${lineNum}-${measureNum}`
      const detailsArray = measureDetails[key]
      
      if (detailsArray && detailsArray.length > 0) {
        // Existing measure(s) with details - pass the array
        setSelectedMeasure({
          page: pageNum,
          line: lineNum,
          measure: measureNum,
          measureDetailsRecords: detailsArray
        })
      } else {
        // New measure without details
        setSelectedMeasure({
          page: pageNum,
          line: lineNum,
          measure: measureNum,
          confidence: null,
          notes: null,
          practicer: null,
          bpm: null,
          time: null,
          measureDetailsRecords: null
        })
      }
    }
  }

  const handleModalSave = (savedMeasure) => {
    onMeasureUpdate(savedMeasure)
  }

  const handleModalClose = () => {
    setSelectedMeasure(null)
  }

  const handleBulkSave = (savedMeasure) => {
    onMeasureUpdate(savedMeasure)
  }

  const handleBulkClose = () => {
    setShowBulkEdit(false)
    // Exit selection mode and clear selections after bulk edit
    setIsSelectionMode(false)
    setSelectedMeasures(new Set())
  }

  return (
    <div className="page">
      <div className="page-header">
        <span>p{pageNumber}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '20px' }}>
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
            Select Multiple
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
                        opacity: (typeof confidenceRating === 'string' && !['👥', '🙌', '👥🙌'].includes(confidenceRating)) ? 0.5 : 1
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
      
      <EditMeasureDetailsModal
        isOpen={!!selectedMeasure}
        onClose={handleModalClose}
        selectedMeasure={selectedMeasure}
        songId={songId}
        selectedUser={selectedUser}
        selectedHands={selectedHands}
        onSave={handleModalSave}
      />
      
      <BulkEditModal
        isOpen={showBulkEdit}
        onClose={handleBulkClose}
        selectedMeasures={selectedMeasures}
        songId={songId}
        selectedUser={selectedUser}
        selectedHands={selectedHands}
        onSave={handleBulkSave}
      />
    </div>
  )
}

export default PracticeTrackerPage