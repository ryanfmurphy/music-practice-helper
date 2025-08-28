import React, { useRef, useEffect, useState } from 'react'

function ChordOverWord({ chord, word, index, elements }) {
  const chordRef = useRef()
  const [chordWidth, setChordWidth] = useState(0)
  const [wordWidth, setWordWidth] = useState(0)
  
  useEffect(() => {
    if (chordRef.current) {
      const chordElement = chordRef.current.querySelector('.chord')
      const wordElement = chordRef.current.querySelector('.word')
      
      if (chordElement && wordElement) {
        setChordWidth(chordElement.getBoundingClientRect().width)
        setWordWidth(wordElement.getBoundingClientRect().width)
      }
    }
  }, [chord, word])
  
  const isChordOnly = word === '\u00A0' // Non-breaking space means chord-only
  
  let extraSpacing = {}
  
  if (isChordOnly && chordWidth > 0) {
    // For chord-only elements, provide generous spacing based on actual chord width
    const spacingPx = Math.max(chordWidth * 1.2, 32) // At least 32px for chord-only
    extraSpacing.paddingRight = `${spacingPx}px`
  } else if (chordWidth > wordWidth && chordWidth > 0) {
    // For chord-over-word, add extra spacing when chord is wider than word
    const extraPx = (chordWidth - wordWidth) * 1.1 // 10% extra buffer
    extraSpacing.paddingRight = `${extraPx}px`
  }
  
  return (
    <span 
      ref={chordRef}
      key={index} 
      className="chord-over-word"
      style={extraSpacing}
    >
      <span className="chord">{chord}</span>
      <span className="word">{word}</span>
    </span>
  )
}

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
        return (
          <ChordOverWord
            key={index}
            chord={element.chord}
            word={element.word}
            index={index}
            elements={elements}
          />
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