import React from 'react';
import './TextViewer.css';
// Importamos nuestras nuevas herramientas
import { generateShortCode } from '../utils/parsingHelper';
//import { glossary } from '../utils/glossary';

														 
function TextViewer({ verseData, onWordClick }) {
  if (!verseData) {
    return (
      <div className="text-viewer-container">
        <p>Seleccione un pasaje para ver el texto.</p>
      </div>
    );
  }

  return (
    <div className="text-viewer-container">
      <h3>{verseData.reference}</h3>
      <div className="interlinear-verse">
        {verseData.words.map(word => {
          const shortCode = generateShortCode(word.pos, word.parsing);
          // La traducción ahora viene directamente de la API (word.gloss)
          //const translation = word.gloss || '---';

          return (
            <div key={word.id} className="word-stack" onClick={() => onWordClick(word)}>
              <div className="parsing-code">{shortCode}</div>
              <div className="greek-word-interlinear">{word.text}</div>
              {/* <div className="translation">{translation}</div> */} {/* <-- LÍNEA ELIMINADA */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
export default TextViewer;