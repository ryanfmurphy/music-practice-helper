import React from 'react'

function LyricsLeadSheet({ lyricsLeadSheetTxt }) {
  return (
    <div className="music-lead-sheet">
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
    </div>
  )
}

export default LyricsLeadSheet