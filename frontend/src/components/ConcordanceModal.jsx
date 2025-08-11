import React, { useState, useEffect } from 'react';
import './ConcordanceModal.css';

import { useLanguage } from '../context/LanguageContext';

function ConcordanceModal({ wordData, onClose }) {

  const { localized } = useLanguage();  

  const [concordance, setConcordance] = useState({ lemmaOccurrences: [], textOccurrences: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (wordData.lemma && wordData.text) {
      setIsLoading(true);
      fetch(`${urls.apiBase}/word/concordance/${encodeURIComponent(wordData.lemma)}/${encodeURIComponent(wordData.text)}`)
        .then(res => res.json())
        .then(data => {
          setConcordance(data);
        })
        .catch(err => console.error('Error al cargar la concordancia:', err))
        .finally(() => setIsLoading(false));
    }
  }, [wordData, urls.apiBase]);

  // Función para resaltar la palabra en el texto del versículo
  const highlightWord = (verseText, wordToHighlight) => {
    const regex = new RegExp(`(${wordToHighlight})`, 'gi');
    return verseText.split(regex).map((part, index) => 
      regex.test(part) ? <strong key={index}>{part}</strong> : part
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{localized.ui.concordanceModal.title.replace("{word}", wordData.text)}</h2>

        {isLoading ? (
          <p>{localized.ui.concordanceModal.loading}</p>
        ) : (
          <div className="concordance-columns">
            {/* Columna para la Raíz (Lemma) */}
            <div className="concordance-section">
              <h3>{localized.ui.concordanceModal.lemmaHeader.replace("{lemma}", wordData.lemma).replace("{count}", concordance.lemmaOccurrences.length)}</h3>
              <div className="results-list">
                {concordance.lemmaOccurrences.map((item, index) => (
                  <div key={`lemma-${index}`} className="concordance-item">
                    <span className="concordance-ref">{item.reference}</span>
                    <p className="concordance-text">{highlightWord(item.text, wordData.lemma)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna para la Forma Exacta */}
            <div className="concordance-section">
              <h3>{localized.ui.concordanceModal.textHeader.replace("{text}", wordData.text).replace("{count}", concordance.textOccurrences.length)}</h3>
              <div className="results-list">
                {concordance.textOccurrences.map((item, index) => (
                  <div key={`text-${index}`} className="concordance-item">
                    <span className="concordance-ref">{item.reference}</span>
                    <p className="concordance-text">{highlightWord(item.text, wordData.text)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ConcordanceModal;
