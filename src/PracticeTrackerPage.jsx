import React, { useState } from 'react'

function PracticeTrackerPage({ pageNumber, lines, startingMeasure, measureDetails = {} }) {
  const [selectedMeasure, setSelectedMeasure] = useState(null)
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
      setSelectedMeasure(details)
    }
  }

  const closePopup = () => {
    setSelectedMeasure(null)
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
              <h3>Measure {selectedMeasure.measure} Details</h3>
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
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PracticeTrackerPage