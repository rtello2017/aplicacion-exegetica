import React from 'react';
import './PassageNavigator.css';

function PassageNavigator({ onPrevBook, onPrevVerse, onNextVerse, onNextBook }) {
  return (
    <div className="passage-navigator">
      <button onClick={onPrevBook} title="Libro Anterior">«</button>
      <button onClick={onPrevVerse} title="Versículo Anterior">‹</button>
      <button onClick={onNextVerse} title="Siguiente Versículo">›</button>
      <button onClick={onNextBook} title="Siguiente Libro">»</button>
    </div>
  );
}

export default PassageNavigator;