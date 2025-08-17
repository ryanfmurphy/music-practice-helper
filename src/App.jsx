import React from 'react'
import './App.css'
import PracticeTrackerPage from './PracticeTrackerPage'

function App() {
  // Page data: pageNumber, lines (measures per line), startingMeasure
  const pages = [
    { pageNumber: 8, lines: [5, 3, 3, 3], startingMeasure: 1 },
    { pageNumber: 9, lines: [3, 3, 3, 3, 3], startingMeasure: 15 },
    { pageNumber: 10, lines: [3, 4, 3, 3, 3], startingMeasure: 30 },
    { pageNumber: 11, lines: [3, 3, 3, 4, 3], startingMeasure: 46 },
    { pageNumber: 12, lines: [3, 2, 3, 2, 2], startingMeasure: 62 },
    { pageNumber: 13, lines: [2, 2, 2, 2, 2], startingMeasure: 74 }
  ]

  return (
    <div className="container">
      <div className="pages-container">
        <PracticeTrackerPage {...pages[0]} />
        <PracticeTrackerPage {...pages[1]} />
      </div>
      
      <div className="pages-container">
        <PracticeTrackerPage {...pages[2]} />
        <PracticeTrackerPage {...pages[3]} />
      </div>
      
      <div className="pages-container">
        <PracticeTrackerPage {...pages[4]} />
        <PracticeTrackerPage {...pages[5]} />
      </div>
    </div>
  )
}

export default App
