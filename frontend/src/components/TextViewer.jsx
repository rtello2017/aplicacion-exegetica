import React from 'react';

// --- Componente para una sola palabra ---
// Se ha actualizado la lógica para manejar el número Strong correctamente.
function Word({ wordData, onWordClick, onWordDragStart }) {
  // --- LÓGICA DE STRONGS CORREGIDA ---
  // Ahora comprueba si 'strongs' existe y no es nulo.
  const hasStrongs = wordData.strongs != null;
  // Formatea el número para que siempre sea una cadena con "G" al principio.
  const formattedStrongs = hasStrongs ? `G${wordData.strongs}` : null;
  const strongsUrl = hasStrongs ? `https://biblehub.com/greek/${wordData.strongs}.htm` : null;
  // --- FIN DE LA CORRECCIÓN ---

  // Lógica de concatenación para POS y parsing (sin cambios)
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
          {/* Muestra el número Strong ya formateado */}
          {formattedStrongs}
        </a>
      ) : (
        <span>&nbsp;</span>
      )}

      {/* Línea 2: Código de análisis combinado */}
      <span className="parsing-code">{combinedDisplay}</span>
      
      {/* Línea 3: Texto griego */}
      <span 
        className="greek-word-interlinear" 
        onClick={() => onWordClick(wordData)}
        onDragStart={(e) => onWordDragStart(e, wordData)}
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
function TextViewer({ verseData, onWordClick, onWordDragStart }) {
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
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default TextViewer;
