import React from 'react';
import './TextViewer.css';
import { generateShortCode } from '../utils/parsingHelper';

function TextViewer({ verseData, onWordClick }) {
  if (!verseData || !verseData.verses) {
    return (
      <div className="text-viewer-container">
        <p>Seleccione un pasaje para ver el texto.</p>
      </div>
    );
  }

  return (
    <div className="text-viewer-container">
      <h3>{verseData.reference}</h3>
      {/* Iteramos sobre cada versículo en los datos */}
      {verseData.verses.map(verse => (
        <div key={verse.verse} className="verse-block">
          <span className="verse-number">{verse.verse}</span>
          <div className="interlinear-verse">
            {verse.words.map(word => {
              const shortCode = generateShortCode(word.pos, word.parsing);
              const translation = word.user_translation || '';

              return (
                <div key={word.id} className="word-stack" onClick={() => onWordClick(word)}>
                  <div className="parsing-code">{shortCode}</div>
                  <div className="greek-word-interlinear">{word.text}</div>
                  <div className="translation">{translation}</div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
export default TextViewer;