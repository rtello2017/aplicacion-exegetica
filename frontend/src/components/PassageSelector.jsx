import React from 'react';
import './PassageSelector.css';

function PassageSelector({
  books, chapters, verses,
  selectedBookId, setSelectedBookId,
  selectedChapter, setSelectedChapter,
  selectedVerse, setSelectedVerse,
  rangeInput, setRangeInput,
  handleRangeLoad
}) {
  return (
    <div className="passage-selector-container">
      <h2>Seleccionar Pasaje</h2>
      <div className="selectors">
        <div className="selector-group">
          <label htmlFor="book">Libro</label>
          <select id="book" value={selectedBookId} onChange={(e) => setSelectedBookId(parseInt(e.target.value))}>
            {/* Elige un libro... */}
            <option value="" disabled>Selecciona un libro</option>
            {books.map(book => (
              <option key={book.book_id} value={book.book_id}>
                {book.name}
              </option>
            ))}
          </select>
        </div>

        <div className="selector-group">
          <label htmlFor="chapter">Capítulo</label>
          <select id="chapter" value={selectedChapter} onChange={(e) => setSelectedChapter(parseInt(e.target.value))}>
            {chapters.map(chapter => (
              <option key={chapter} value={chapter}>
                {chapter}
              </option>
            ))}
          </select>
        </div>

        <div className="selector-group">
          <label htmlFor="verse">Versículo</label>
          <select id="verse" value={selectedVerse} onChange={(e) => setSelectedVerse(e.target.value)}>
            <option key="all" value="ALL">TODOS</option>

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
          placeholder="Ej: John 3:16-18"
          value={rangeInput}
          onChange={(e) => setRangeInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleRangeLoad()}
        />
        <button onClick={handleRangeLoad}>Cargar Pasaje</button>
      </div>
    </div>
  );
}

export default PassageSelector;