import React from 'react'

function LyricsLeadSheet({ lyricsLeadSheetTxt }) {
  const parseLeadSheetText = (text) => {
    if (!text) return []
    
    const lines = text.split('\n')
    
    return lines.map((line, lineIndex) => {
      const elements = []
      let currentPosition = 0
      
      // Find all chord patterns [ChordName]
      const chordRegex = /\[([^\]]+)\]/g
      let match
      
      while ((match = chordRegex.exec(line)) !== null) {
        const chordStart = match.index
        const chordEnd = chordRegex.lastIndex
        const chordName = match[1]
        
        // Add text before the chord (if any)
        if (chordStart > currentPosition) {
          const textBefore = line.substring(currentPosition, chordStart)
          elements.push({ type: 'text', content: textBefore })
        }
        
        // Find the word immediately after the chord
        const textAfterChord = line.substring(chordEnd)
        const wordMatch = textAfterChord.match(/^(\S+)/)
        
        if (wordMatch) {
          const word = wordMatch[1]
          elements.push({
            type: 'chord-over-word',
            chord: chordName,
            word: word
          })
          currentPosition = chordEnd + word.length
        } else {
          // No word after chord, show chord above empty space
          elements.push({
            type: 'chord-over-word',
            chord: chordName,
            word: '\u00A0' // Non-breaking space for empty word
          })
          currentPosition = chordEnd
        }
      }
      
      // Add any remaining text after the last chord
      if (currentPosition < line.length) {
        const remainingText = line.substring(currentPosition)
        elements.push({ type: 'text', content: remainingText })
      }
      
      return { lineIndex, elements }
    })
  }
  
  const renderElements = (elements) => {
    return elements.map((element, index) => {
      if (element.type === 'text') {
        // Replace spaces with &nbsp; to preserve spacing
        return element.content.replace(/ /g, '\u00A0')
      } else if (element.type === 'chord-over-word') {
        return (
          <span key={index} className="chord-over-word">
            <span className="chord">{element.chord}</span>
            <span className="word">{element.word}</span>
          </span>
        )
      }
      return null
    })
  }
  
  const parsedLines = parseLeadSheetText(lyricsLeadSheetTxt)
  
  return (
    <div className="music-lead-sheet">
      {parsedLines.map(({ lineIndex, elements }) => (
        <div key={lineIndex} className="line">
          {renderElements(elements)}
        </div>
      ))}
      
      {/* Sample HTML for reference:
      <div className="line">
        You are my&nbsp;
        <span className="chord-over-word">
          <span className="chord">Db</span>
          <span className="word">sunshine,</span>
        </span>
        &nbsp;my only sunshine
      </div>
      
      <div className="line">
        You make me&nbsp;
        <span className="chord-over-word">
          <span className="chord">Gb</span>
          <span className="word">happy</span>
        </span>
        &nbsp;when skies are&nbsp;
        <span className="chord-over-word">
          <span className="chord">Db</span>
          <span className="word">grey</span>
        </span>
      </div>
      */}
    </div>
  )
}

export default LyricsLeadSheet