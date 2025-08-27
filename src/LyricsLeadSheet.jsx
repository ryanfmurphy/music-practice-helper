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
        
        // Find the word immediately after the chord (up to next chord or whitespace)
        const textAfterChord = line.substring(chordEnd)
        const wordMatch = textAfterChord.match(/^([^\s\[]+)/)
        
        if (wordMatch) {
          const word = wordMatch[1]
          
          // Check if there's another chord after this word part (indicating a split word)
          const remainingText = line.substring(chordEnd + word.length)
          const hasFollowingChord = remainingText.match(/^\[/)
          const needsHyphen = hasFollowingChord && word.match(/^[a-zA-Z]+$/) // Only hyphenate alphabetic words
          
          elements.push({
            type: 'chord-over-word',
            chord: chordName,
            word: needsHyphen ? word + ' -' : word
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
        // Calculate if we need extra spacing for long chords
        const chordLength = element.chord.length
        const wordLength = element.word.length
        const isChordOnly = element.word === '\u00A0' // Non-breaking space means chord-only
        
        // Check if next element is also a chord-only (for consecutive chords)
        const nextElement = elements[index + 1]
        const nextIsChordOnly = nextElement && nextElement.type === 'chord-over-word' && nextElement.word === '\u00A0'
        
        let extraSpacing = {}
        
        if (isChordOnly) {
          // For chord-only elements, add minimum spacing based on chord length
          const minSpacing = Math.max(chordLength * 0.3, 2) // At least 2em for chord-only
          extraSpacing.paddingRight = `${minSpacing}em`
        } else {
          // For chord-over-word, add extra spacing if chord is significantly longer than the word
          const needsExtraSpace = chordLength > wordLength + 2
          if (needsExtraSpace) {
            extraSpacing.paddingRight = `${(chordLength - wordLength) * 0.3}em`
          }
        }
        
        return (
          <span 
            key={index} 
            className="chord-over-word"
            style={extraSpacing}
          >
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