import React from 'react'

function PracticeTrackerPage({ pageNumber, lines, startingMeasure }) {
  let currentMeasure = startingMeasure

  return (
    <div className="page">
      <div className="page-header">p{pageNumber}</div>
      
      {lines.map((numMeasures, lineIndex) => {
        const measuresForThisLine = []
        for (let i = 0; i < numMeasures; i++) {
          measuresForThisLine.push(currentMeasure + i)
        }
        currentMeasure += numMeasures

        return (
          <div key={lineIndex} className="line-container">
            <div className="measure-row">
              {measuresForThisLine.map(measureNumber => (
                <div key={measureNumber} className="measure">
                  {measureNumber}
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