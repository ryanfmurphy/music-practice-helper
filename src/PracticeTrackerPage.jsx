import React from 'react'

function PracticeTrackerPage({ pageNumber, lines, startingMeasure, measureConfidence = {} }) {
  let currentMeasure = startingMeasure

  const getConfidenceStyle = (pageNum, lineNum, measureNum) => {
    const key = `${pageNum}-${lineNum}-${measureNum}`
    const confidence = measureConfidence[key]
    
    if (confidence === undefined) return {}
    
    // Create traffic light gradient: red (0) → yellow (5) → green #00bb00 (10)
    const ratio = confidence / 10
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
      fontWeight: 'bold'
    }
  }

  const getConfidenceContent = (pageNum, lineNum, measureNum) => {
    const key = `${pageNum}-${lineNum}-${measureNum}`
    const confidence = measureConfidence[key]
    
    if (confidence === 10) {
      return `${measureNum} ⭐`
    }
    return measureNum
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
                >
                  {getConfidenceContent(pageNumber, lineNumber, measureNumber)}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default PracticeTrackerPage