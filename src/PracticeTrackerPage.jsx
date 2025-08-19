import React, { useState } from 'react'
import EditMeasureDetailsModal from './EditMeasureDetailsModal'

function PracticeTrackerPage({ pageNumber, lines, startingMeasure, measureDetails = {}, songId, selectedUser, selectedHands, onMeasureUpdate }) {
  const [selectedMeasure, setSelectedMeasure] = useState(null)
  let currentMeasure = startingMeasure

  const getConfidenceStyle = (pageNum, lineNum, measureNum) => {
    const key = `${pageNum}-${lineNum}-${measureNum}`
    const detailsArray = measureDetails[key]
    
    if (!detailsArray || detailsArray.length === 0) return {}
    
    // If multiple records, determine background color based on what varies
    if (detailsArray.length > 1) {
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
      
      return {
        backgroundColor,
        color: 'black',
        fontWeight: 'bold',
        cursor: 'pointer'
      }
    }
    
    // Single practitioner - use normal traffic light colors
    const details = detailsArray[0]
    const confidence = details.confidence
    let red, green, blue
    
    if (confidence < 5) {
      // Red zone (0-4.9): interpolate from dark red to yellow
      const ratio = confidence / 5
      red = 220 - (ratio * 50)  // 220 to 170
      green = ratio * 100       // 0 to 100
      blue = 50
    } else if (confidence < 6) {
      // Yellow zone (5.0-5.9): interpolate from yellow to light green
      const ratio = (confidence - 5) / 1
      red = 200 - (ratio * 100)  // 200 to 100
      green = 200 + (ratio * 55)  // 200 to 255
      blue = 50
    } else {
      // Green zone (6.0-10.0): interpolate to brighter green
      const ratio = Math.min((confidence - 6) / 4, 1)
      red = 100 - (ratio * 50)   // 100 to 50
      green = 255
      blue = 50 + (ratio * 50)   // 50 to 100
    }

    return {
      backgroundColor: `rgb(${red}, ${green}, ${blue})`,
      color: 'black',
      fontWeight: 'bold',
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

  const handleModalSave = (savedMeasure) => {
    onMeasureUpdate(savedMeasure)
  }

  const handleModalClose = () => {
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
    </div>
  )
}

export default PracticeTrackerPage