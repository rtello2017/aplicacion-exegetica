import React, { useState, useEffect } from 'react';
import './AnalysisPopup.css';
import ConcordanceModal from './ConcordanceModal';

// MODIFICACIÓN: Se importan las funciones desde el archivo centralizado de utilidades.
import { getFullPosName, parseDetailedMorphology } from '../utils/morphologyParser.js';

import { useLanguage } from '../context/LanguageContext';

function AnalysisPopup({ wordData, onClose, onSave }) {
  
  const { localized, urls } = useLanguage();

  // Estados para los datos del formulario
  const [strongs, setStrongs] = useState(wordData.strongs || '');
  const [userTranslation, setUserTranslation] = useState(wordData.user_translation || '');
  const [isEditing, setIsEditing] = useState(false);

  // Estados para estadísticas y concordancia
  const [stats, setStats] = useState({ lemmaCount: null, textCount: null });
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isConcordanceOpen, setIsConcordanceOpen] = useState(false);

  //const strongsLink = `https://biblehub.com/greek/${wordData.strongs}.htm`;
  const strongsLink = wordData.strongs ? urls.strongs.replace('{strongs}', wordData.strongs) : '#';

  useEffect(() => {
    if (wordData.lemma && wordData.text) {
      setIsLoadingStats(true);
      fetch(`${urls.apiBase}/word/stats/${encodeURIComponent(wordData.lemma)}/${encodeURIComponent(wordData.text)}`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error("Error al cargar estadísticas:", err))
        .finally(() => setIsLoadingStats(false));
    }
  }, [wordData, urls.apiBase]);

  const handleSave = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const promises = [];
    promises.push(fetch(`${urls.apiBase}/word/${wordData.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strongs }),
    }));
    promises.push(fetch(`${urls.apiBase}/translation/${wordData.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
              {wordData.text} ({localized.ui.analysisPopup.strongLabel} <a href={strongsLink} target="_blank" rel="noopener noreferrer">G{wordData.strongs}</a>)
            </h2>
            <button onClick={handleToggleEdit} className="edit-button-header">
            {isEditing ? localized.ui.analysisPopup.saveButton : localized.ui.analysisPopup.editButton}
            </button>
          </div>

          <div className="popup-section">
            <h3>{localized.ui.analysisPopup.yourAnalysis}</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="strong"><strong>{localized.ui.analysisPopup.strongLabel}</strong></label>
                <input id="strong" type="text" value={strongs} onChange={e => setStrongs(e.target.value)} readOnly={!isEditing} disabled={!isEditing} />
              </div>
              <div className="form-field">
                <label htmlFor="translation"><strong>{localized.ui.analysisPopup.translationLabel}</strong></label>
                <input id="translation" type="text" value={userTranslation} onChange={e => setUserTranslation(e.target.value)} readOnly={!isEditing} disabled={!isEditing} />
              </div>
            </div>
          </div>
          
          <hr />

          <div className="popup-section">
            <div className="form-grid">
                <p><strong>{localized.ui.analysisPopup.rootLabel}</strong> {wordData.lemma} </p>
                <p><strong>{localized.ui.analysisPopup.transliterationLabel}</strong> {wordData.transliteration} </p>
                <p><strong>{localized.ui.analysisPopup.glossLabel}</strong> {wordData.gloss}</p>
                <p><strong>{localized.ui.analysisPopup.definitionLabel}</strong> {wordData.definition}</p>
            </div>
          </div>

          <hr />
          
          <div className="popup-section">
            <h3>{localized.ui.analysisPopup.morphologyTitle}</h3>
            <p><strong>{localized.ui.analysisPopup.posLabel}</strong> {posInfo.abbr} - {posInfo.name}</p>
            <p><strong>{localized.ui.analysisPopup.parsingLabel}</strong> {parsingInfo.cleanCode} - {parsingInfo.description}</p>
          </div>

          <hr />

          <div className="popup-section">
            <h3>{localized.ui.analysisPopup.statsTitle}</h3>
            {isLoadingStats ? <p>{localized.ui.analysisPopup.loading}</p> : (
              <div className="stats-container">
                <p><strong>{localized.ui.analysisPopup.lemmaOccurrences.replace("{lemma}", wordData.lemma).replace("{count}", stats.lemmaCount)}</strong></p>
                <p><strong>{localized.ui.analysisPopup.textOccurrences.replace("{text}", wordData.text).replace("{count}", stats.textCount)}</strong></p>
                <button 
                  className="concordance-button" 
                  onClick={() => setIsConcordanceOpen(true)}
                >
                  {localized.ui.analysisPopup.concordanceButton}
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