import React from 'react';
import './AnalysisPopup.css';
import { translateParsingCode } from '../utils/parsingHelper';

function AnalysisPopup({ wordData, onClose }) {
  if (!wordData) return null;

  const detailedAnalysis = translateParsingCode(wordData.pos, wordData.parsing);

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close-btn" onClick={onClose}>×</button>
        <h2>Análisis de la Palabra</h2>

        <div className="analysis-grid">
          <div className="analysis-item">
            <strong>Texto:</strong>
            <span className="greek-text">{wordData.text}</span>
          </div>
          <div className="analysis-item">
            <strong>Transliteración:</strong>
            <span>{wordData.transliteration || 'N/A'}</span>
          </div>
          <div className="analysis-item">
            <strong>Lema:</strong>
            <span>{wordData.lemma}</span>
          </div>
          <div className="analysis-item">
            <strong>Nº Strong:</strong>
            <span>{wordData.strongs ? `G${wordData.strongs}` : 'N/A'}</span>
          </div>
        </div>

        <hr />

        <div className="analysis-item">
          <strong>Análisis Morfológico:</strong>
          <span>{detailedAnalysis}</span>
        </div>

        <div className="analysis-item">
          <strong>Definición Breve (Glosa):</strong>
          <span>{wordData.gloss || 'N/A'}</span>
        </div>

        <div className="analysis-item">
          <strong>Definición Completa:</strong>
          <p className="definition-text">{wordData.definition || 'N/A'}</p>
        </div>
      </div>
    </div>
  );
}

export default AnalysisPopup;