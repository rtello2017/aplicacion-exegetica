import React, { useState } from 'react';
import './AnalysisPopup.css';
import { translateParsingCode } from '../utils/parsingHelper';

function AnalysisPopup({ wordData, onClose, onSave }) {
  const [isEditing, setIsEditing] = useState(false);

  // Solo creamos estados para los campos que realmente guardaremos
  const [strongs, setStrongs] = useState(wordData.strongs || '');
  const [translation, setTranslation] = useState(wordData.user_translation || '');

  const detailedAnalysis = translateParsingCode(wordData.pos, wordData.parsing);

  const handleSave = async () => {
    // 1. Guardar/actualizar el N° de Strong para esta palabra
    await fetch(`http://localhost:4000/api/word/${wordData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strongs: parseInt(strongs) || null }),
    });
    
    // 2. Guardar/actualizar la traducción personalizada para esta palabra
    await fetch(`http://localhost:4000/api/translation/${wordData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_translation: translation }),
    });

    onSave(); // Refresca la vista principal para mostrar los cambios
    onClose(); // Cierra el popup
  };

  // Dentro de AnalysisPopup.jsx, reemplaza solo el return
return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={onClose}>×</button>
        {!isEditing && (
          <button className="popup-edit-btn" onClick={() => setIsEditing(true)}>
            ✏️ Editar
          </button>
        )}
        <h2>{isEditing ? 'Editar Anotaciones' : 'Análisis de la Palabra'}</h2>

        <div className="analysis-section">
          <strong>Traducción Personal:</strong>
          {isEditing ? (
            <input type="text" value={translation} onChange={(e) => setTranslation(e.target.value)} className="editable-field" />
          ) : (
            <p>{translation || 'N/A'}</p>
          )}
        </div>

        <hr />

        <div className="analysis-grid">
          <strong>Texto:</strong>
          <span className="greek-text">{wordData.text}</span>

          <strong>Lema:</strong>
          <span>{wordData.lemma}</span>

          <strong>Nº Strong:</strong>
          {isEditing ? (
            <input type="text" value={strongs} onChange={(e) => setStrongs(e.target.value)} className="editable-field" />
          ) : ( wordData.strongs ? ( <a href={`https://biblehub.com/greek/${wordData.strongs}.htm`} target="_blank" rel="noopener noreferrer">G{wordData.strongs}</a> ) : ( <span>N/A</span> )
          )}

          <strong>Transliteración:</strong>
          <span>{wordData.transliteration || 'N/A'}</span>
        </div>

        <div className="analysis-section">
          <strong>Análisis Morfológico:</strong>
          <p>{detailedAnalysis}</p>
        </div>

        <div className="analysis-section">
          <strong>Definición (Glosa):</strong>
          <p>{wordData.gloss || 'N/A'}</p>
        </div>

        <div className="analysis-section">
          <strong>Definición Completa:</strong>
          <p className="definition-text">{wordData.definition || 'N/A'}</p>
        </div>

        {isEditing && (
          <button className="popup-save-btn" onClick={handleSave}>
            Guardar Cambios
          </button>
        )}
      </div>
    </div>
  );
}

export default AnalysisPopup;