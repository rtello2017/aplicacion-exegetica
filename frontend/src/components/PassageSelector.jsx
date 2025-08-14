import React from 'react';
import './PassageSelector.css';
// ✅ 1. Importar el objeto de configuración.
import { useLanguage } from '../context/LanguageContext'; 

function PassageSelector({
  books, chapters, verses,
  selectedBookId, setSelectedBookId,
  selectedChapter, setSelectedChapter,
  selectedVerse, setSelectedVerse,
  rangeInput, setRangeInput,
  handleRangeLoad
}) {

  // ✅ 3. Obtener los textos para el idioma actual.
  const { localized } = useLanguage();  

  return (
    <div className="passage-selector-container">
      <div className="selectors">
        <div className="selector-group">
          <label htmlFor="book">{localized.ui.passageSelector.book}</label>
          <select id="book" value={selectedBookId} onChange={(e) => setSelectedBookId(parseInt(e.target.value))}>
            {/* Elige un libro... */}
            <option value="" disabled>{localized.ui.passageSelector.selectBook}</option>
            {books.map(book => (
              <option key={book.book_id} value={book.book_id}>
                {book.name}
              </option>
            ))}
          </select>
        </div>

        <div className="selector-group">
          <label htmlFor="chapter">{localized.ui.passageSelector.chapter}</label>
          <select id="chapter" value={selectedChapter} onChange={(e) => setSelectedChapter(parseInt(e.target.value))}>
            {chapters.map(chapter => (
              <option key={chapter} value={chapter}>
                {chapter}
              </option>
            ))}
          </select>
        </div>

        <div className="selector-group">
          <label htmlFor="verse">{localized.ui.passageSelector.verse}</label>
          <select id="verse" value={selectedVerse} onChange={(e) => setSelectedVerse(e.target.value)}>
            <option key="all" value="ALL">{localized.ui.passageSelector.allVerses}</option>

            {verses.map(verse => (
              <option key={verse} value={verse}>
                {verse}
              </option>
            ))}
          </select>
        </div>
      </div>
      {/* Nuevo formulario para rangos */}
      <div className="range-selector">
        <input 
          type="text" 
          className="range-input"
          placeholder={localized.ui.passageSelector.rangePlaceholder}
          value={rangeInput}
          onChange={(e) => setRangeInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRangeLoad()}
        />
        <button onClick={handleRangeLoad}>{localized.ui.passageSelector.loadButton}</button>
      </div>
    </div>
  );
}

export default PassageSelector;