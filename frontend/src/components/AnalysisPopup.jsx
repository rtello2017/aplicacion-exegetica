import React, { useState, useEffect } from 'react';
import './AnalysisPopup.css';
import ConcordanceModal from './ConcordanceModal';
import { SessionExpiredError } from '../utils/errors';

// MODIFICACIÓN: Se importan las funciones desde el archivo centralizado de utilidades.
import { getFullPosName, parseDetailedMorphology } from '../utils/morphologyParser.js';

import { useLanguage } from '../context/LanguageContext';

import { apiFetch } from '../utils/api';

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

  // ✅ NUEVOS ESTADOS PARA LA EDICIÓN DE MORFOLOGÍA
  const [isMorphEditing, setIsMorphEditing] = useState(false);
  const [parsingInput, setParsingInput] = useState(wordData.parsing || '');

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

  const handleSave = async () => {
      try {
          // Usamos Promise.all para que ambas peticiones se ejecuten en paralelo
          await Promise.all([
              // Petición para guardar el número de Strong
              apiFetch(`/word/${wordData.id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({ strongs }),
              }),
              // Petición para guardar la traducción del usuario
              apiFetch(`/translation/${wordData.id}`, {
                  method: 'PATCH',
                  body: JSON.stringify({ user_translation: userTranslation }),
              })
          ]);

          onSave(); // Refresca los datos en la app principal
          onClose(); // Cierra el popup

      } catch (error) {
          console.error("Error al guardar:", error);
          // apiFetch ya maneja la redirección si la sesión expira
          if (!(error instanceof SessionExpiredError)) { // <-- Compara el tipo, es robusto
              alert(localized.ui.app.notesConnectionError);
          }
      }
  };

  const handleSaveMorphology = async () => {
      try {
          await apiFetch(`/word/parsing/${wordData.id}`, {
              method: 'PATCH',
              body: JSON.stringify({ parsing: parsingInput }),
          });
          
          // Desactiva el modo edición
          setIsMorphEditing(false);
          // Llama a onSave() para refrescar los datos de toda la aplicación
          onSave();
          onClose();
      } catch (error) {
          console.error("Error al guardar la morfología:", error);
          if (!(error instanceof SessionExpiredError)) { // <-- Compara el tipo, es robusto
              alert(localized.ui.app.analysisMorphologyError);
          }
      }
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
            <div className="morphology-header">
              <h3>{localized.ui.analysisPopup.morphologyTitle}</h3>
              
              {!isMorphEditing && (
                <button 
                  onClick={() => {
                    if (window.confirm(localized.ui.analysisPopup.morphEditor.confirmMessage)) {
                      setIsMorphEditing(true);
                    }
                  }}
                  className="correct-morph-button"
                >
                  {localized.ui.analysisPopup.morphEditor.editButton}
                </button>
              )}
            </div>

            {isMorphEditing ? (
              // --- VISTA DE EDICIÓN ---
              <div className="morph-edit-form">
                <div className="form-field">
                  <label htmlFor="parsing-edit">
                    <strong>{localized.ui.analysisPopup.morphEditor.parsingCodeLabel}</strong>
                  </label>
                  <input 
                    id="parsing-edit" 
                    type="text" 
                    value={parsingInput} 
                    onChange={e => setParsingInput(e.target.value)} 
                    placeholder={localized.ui.analysisPopup.morphEditor.parsingPlaceholder}
                  />
                </div>
                <div className="morph-edit-actions">
                  <button onClick={() => setIsMorphEditing(false)} className="cancel-button">
                    {localized.ui.analysisPopup.morphEditor.cancelButton}
                  </button>
                  <button onClick={handleSaveMorphology} className="save-button">
                    {localized.ui.analysisPopup.morphEditor.saveButton}
                  </button>
                </div>
              </div>
            ) : (
              // --- VISTA NORMAL ---
              <>
                <p><strong>{localized.ui.analysisPopup.posLabel}</strong> {posInfo.abbr} - {posInfo.name}</p>
                <p><strong>{localized.ui.analysisPopup.parsingLabel}</strong> {parsingInfo.cleanCode} - {parsingInfo.description}</p>
              </>
            )}
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