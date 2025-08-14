import React from 'react';
// MODIFICACIÓN: Importamos las funciones desde el archivo de utilidades
import { getFullPosName, parseDetailedMorphology } from '../utils/morphologyParser';

import { useLanguage } from '../context/LanguageContext';

// --- Componente para una sola palabra ---
function Word({ wordData, onWordClick, onWordDragStart, onWordDoubleClick }) {
  
  // ✅ Obtener el paquete de textos para el idioma actual.
  const { localized, urls } = useLanguage();

  // Lógica de Strongs
  const hasStrongs = wordData.strongs != null;
  //const formattedStrongs = hasStrongs ? `G${wordData.strongs}` : null;
  //const strongsUrl = hasStrongs ? `https://biblehub.com/greek/${wordData.strongs}.htm` : null;
  const strongsUrl = hasStrongs 
    ? urls.strongs.replace('{strongs}', wordData.strongs)
    : null;

  // Lógica de visualización para el interlineal
  const formattedPos = wordData.pos ? wordData.pos.replace(/-/g, ' ') : '';
  const formattedParsing = wordData.parsing ? wordData.parsing.replace(/-/g, ' ') : '';
  let combinedDisplay = formattedPos;
  if (formattedParsing) {
    combinedDisplay += ` - ${formattedParsing}`;
  }

  // MODIFICACIÓN: Obtenemos la información parseada para el tooltip
  const tooltipPosInfo = getFullPosName(wordData.pos);
  const tooltipParsingInfo = parseDetailedMorphology(wordData.parsing, wordData.pos);

  return (
    // El contenedor principal ahora tiene la clase 'word-stack' y el tooltip dentro
    <div className="word-stack">
      {/* Línea 1: Número Strong */}
      {hasStrongs ? (
        <a href={strongsUrl} target="_blank" rel="noopener noreferrer">
          {`G${wordData.strongs}`}
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

      {/* MODIFICACIÓN: El nuevo tooltip */}
      <div className="word-tooltip">
        <p><strong>{localized.ui.textViewer.tooltipRoot}</strong> {wordData.lemma || localized.ui.textViewer.notAvailable}</p>
        <p><strong>{localized.ui.textViewer.tooltipCategory}</strong> {tooltipPosInfo.name}</p>
        <p><strong>{localized.ui.textViewer.tooltipAnalysis}</strong> {tooltipParsingInfo.description}</p>
      </div>
    </div>
  );
}


// --- Componente principal del Visor de Texto ---
function TextViewer({ verseData, onWordClick, onWordDragStart, onWordDoubleClick }) {
  
  const { localized } = useLanguage();
  
  if (!verseData || !verseData.verses) {
    return <p>{localized.ui.textViewer.noPassage}</p>;
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