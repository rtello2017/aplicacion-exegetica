import React from 'react';

// --- Componente para una sola palabra ---
// Incluye el manejador de doble clic y la lógica de Strongs corregida
function Word({ wordData, onWordClick, onWordDragStart, onWordDoubleClick }) {
  // Lógica de Strongs corregida para manejar números y formatear con "G"
  const hasStrongs = wordData.strongs != null;
  const formattedStrongs = hasStrongs ? `G${wordData.strongs}` : null;
  const strongsUrl = hasStrongs ? `https://biblehub.com/greek/${wordData.strongs}.htm` : null;

  // Lógica de concatenación para POS y parsing
  const formattedPos = wordData.pos ? wordData.pos.replace(/-/g, ' ') : '';
  const formattedParsing = wordData.parsing ? wordData.parsing.replace(/-/g, ' ') : '';
  let combinedDisplay = formattedPos;
  if (formattedParsing) {
    combinedDisplay += ` - ${formattedParsing}`;
  }

  return (
    <div className="word-stack">
      {/* Línea 1: Número Strong */}
      {hasStrongs ? (
        <a 
          href={strongsUrl} 
          target="_blank" 
          rel="noopener noreferrer"
        >
          {formattedStrongs}
        </a>
      ) : (
        <span>&nbsp;</span>
      )}

      {/* Línea 2: Código de análisis combinado */}
      <span className="parsing-code">{combinedDisplay}</span>
      
      {/* Línea 3: Texto griego con todos los eventos */}
      <span 
        className="greek-word-interlinear" 
        onClick={() => onWordClick(wordData)}
        onDragStart={(e) => onWordDragStart(e, wordData)}
        onDoubleClick={() => onWordDoubleClick(wordData)}
        draggable
      >
        {wordData.text}
      </span>
      
      {/* Línea 4: Traducción del usuario */}
      <span className="translation">{wordData.user_translation}</span>
    </div>
  );
}


// --- Componente principal del Visor de Texto ---
// Pasa todas las props necesarias al componente Word
function TextViewer({ verseData, onWordClick, onWordDragStart, onWordDoubleClick }) {
  if (!verseData || !verseData.verses) {
    return <p>Seleccione un pasaje para comenzar.</p>;
  }

  return (
    <div className="text-viewer">
      <h2>{verseData.reference}</h2>
      {verseData.verses.map((verse, index) => (
        <div key={index} className="verse-block">
          <span className="verse-number">{verse.verse}</span>
          <div className="interlinear-verse">
            {verse.words.map(word => (
              <Word 
                key={word.id} 
                wordData={word} 
                onWordClick={onWordClick}
                onWordDragStart={onWordDragStart}
                onWordDoubleClick={onWordDoubleClick}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TextViewer;
