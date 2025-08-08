import React, { useState, useEffect } from 'react';
import './AnalysisPopup.css';
import ConcordanceModal from './ConcordanceModal';

// MODIFICACIÓN: Se importan las funciones desde el archivo centralizado de utilidades.
import { getFullPosName, parseDetailedMorphology } from '../utils/morphologyParser.js';

function AnalysisPopup({ wordData, onClose, onSave }) {
  // Estados para los datos del formulario
  const [strongs, setStrongs] = useState(wordData.strongs || '');
  const [userTranslation, setUserTranslation] = useState(wordData.user_translation || '');
  const [isEditing, setIsEditing] = useState(false);

  // Estados para estadísticas y concordancia
  const [stats, setStats] = useState({ lemmaCount: null, textCount: null });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isConcordanceOpen, setIsConcordanceOpen] = useState(false);

  const strongsLink = `https://biblehub.com/greek/${wordData.strongs}.htm`;

  useEffect(() => {
    if (wordData.lemma && wordData.text) {
      setIsLoadingStats(true);
      fetch(`http://localhost:4000/api/word/stats/${encodeURIComponent(wordData.lemma)}/${encodeURIComponent(wordData.text)}`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error("Error al cargar estadísticas:", err))
        .finally(() => setIsLoadingStats(false));
    }
  }, [wordData]);

  const handleSave = () => {
    const promises = [];
    promises.push(fetch(`http://localhost:4000/api/word/${wordData.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strongs }),
    }));
    promises.push(fetch(`http://localhost:4000/api/translation/${wordData.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_translation: userTranslation }),
    }));
    
    Promise.all(promises).then(() => {
      onSave();
      onClose();
    }).catch(err => console.error("Error al guardar:", err));
  };

  const handleToggleEdit = () => {
    if (isEditing) {
      handleSave();
    } else {
      setIsEditing(true);
    }
  };

  // MODIFICACIÓN: Se utilizan las funciones importadas.
  const posInfo = getFullPosName(wordData.pos);
  const parsingInfo = parseDetailedMorphology(wordData.parsing, wordData.pos);


  return (
    <>
      <div className="popup-overlay" onClick={onClose}>
        <div className="popup-content" onClick={e => e.stopPropagation()}>
          <button className="popup-close-btn" onClick={onClose}>X</button>
          
          <div className="popup-header">
            <h2 className="greek-word-header">
              {wordData.text} (Strong: <a href={strongsLink} target="_blank" rel="noopener noreferrer">G{wordData.strongs}</a>)
            </h2>
            <button onClick={handleToggleEdit} className="edit-button-header">
              {isEditing ? 'Guardar Cambios' : 'Editar Cambios'}
            </button>
          </div>

          <div className="popup-section">
            <h3>Tu Análisis</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="strong"><strong>Strong:</strong></label>
                <input id="strong" type="text" value={strongs} onChange={e => setStrongs(e.target.value)} readOnly={!isEditing} disabled={!isEditing} />
              </div>
              <div className="form-field">
                <label htmlFor="translation"><strong>Traducción:</strong></label>
                <input id="translation" type="text" value={userTranslation} onChange={e => setUserTranslation(e.target.value)} readOnly={!isEditing} disabled={!isEditing} />
              </div>
            </div>
          </div>
          
          <hr />

          <div className="popup-section">
            <div className="form-grid">
                <p><strong>Transliteración:</strong> {wordData.transliteration} </p>
                <p><strong>Glosa breve:</strong> {wordData.gloss}</p>
                <p><strong>Definición:</strong> {wordData.definition}</p>
            </div>
          </div>

          <hr />
          
          <div className="popup-section">
            <h3>Análisis Morfológico</h3>
            <p><strong>Categoría Gramatical:</strong> {posInfo.abbr} - {posInfo.name}</p>
            <p><strong>Análisis Detallado:</strong> {parsingInfo.cleanCode} - {parsingInfo.description}</p>
          </div>

          <hr />

          <div className="popup-section">
            <h3>Estadísticas del NT</h3>
            {isLoadingStats ? <p>Cargando...</p> : (
              <div className="stats-container">
                <p>La raíz <strong>{wordData.lemma}</strong> aparece: <strong>{stats.lemmaCount}</strong> veces.</p>
                <p>La forma <strong>{wordData.text}</strong> aparece: <strong>{stats.textCount}</strong> veces.</p>
                <button 
                  className="concordance-button" 
                  onClick={() => setIsConcordanceOpen(true)}
                >
                  Ver Concordancia
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isConcordanceOpen && (
        <ConcordanceModal 
          wordData={wordData}
          onClose={() => setIsConcordanceOpen(false)}
        />
      )}
    </>
  );
}

export default AnalysisPopup;