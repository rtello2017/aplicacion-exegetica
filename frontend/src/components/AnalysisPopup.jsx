import React, { useState, useEffect } from 'react';
import './AnalysisPopup.css';
import ConcordanceModal from './ConcordanceModal';

// Leyenda para las categorías gramaticales
const legendData = [
    { abbr: 'N-', name: 'Sustantivo (Noun)', desc: 'Nombres de personas, lugares, cosas o ideas.' },
    { abbr: 'V-', name: 'Verbo (Verb)', desc: 'Palabras que expresan acciones o estados del ser.' },
    { abbr: 'A-', name: 'Adjetivo (Adjective)', desc: 'Palabras que describen o califican a un sustantivo.' },
    { abbr: 'P-', name: 'Pronombre Personal', desc: 'Palabras como "yo", "tú", "él", que sustituyen a un sustantivo.' },
    { abbr: 'RP', name: 'Pronombre Relativo', desc: 'Palabras como "que", "el cual", "quien", que introducen una cláusula relativa.' },
    { abbr: 'RA', name: 'Pronombre Demostrativo', desc: 'Palabras como "este", "ese", "aquel", que señalan a un sustantivo.' },
    { abbr: 'RD', name: 'Pronombre Indefinido', desc: 'Palabras como "alguien", "alguno", "cierto", que no especifican a quién se refieren.' },
    { abbr: 'RI', name: 'Pronombre Interrogativo', desc: 'Palabras como "¿quién?", "¿qué?", "¿cuál?", usadas para preguntar.' },
    { abbr: 'D-', name: 'Artículo Definido', desc: 'El, la, los, las. En griego: ὁ, ἡ, τό.' },
    { abbr: 'C-', name: 'Conjunción (Conjunction)', desc: 'Palabras como "y", "pero", "o", que unen palabras u oraciones.' },
    { abbr: 'RR', name: 'Adverbio (Adverb)', desc: 'Palabras que modifican a un verbo, adjetivo u otro adverbio.' },
    { abbr: 'I-', name: 'Interjección (Interjection)', desc: 'Expresiones como "¡oh!", "¡he aquí!".' },
    { abbr: 'X-', name: 'Partícula (Particle)', desc: 'Palabras que no encajan fácilmente en otras categorías.' },
    { abbr: 'ADV', name: 'Adverbio (Adverb)', desc: 'Palabras que modifican verbos, adjetivos, u otros adverbios.' },
    { abbr: 'CONJ', name: 'Conjunción (Conjunction)', desc: 'Palabras que unen palabras, frases, u oraciones.' },
    { abbr: 'PRT', name: 'Partícula (Particle)', desc: 'Palabras pequeñas que tienen funciones gramaticales.' },
    { abbr: 'PREP', name: 'Preposición (Preposition)', desc: 'Palabras que indican una relación, como "en", "con", "hacia".' },
];


// Función para interpretar el código de parsing morfológico detallado.
const parseDetailedMorphology = (parsingCode, pos) => {
    if (!parsingCode || !pos) {
        return { cleanCode: parsingCode || '', description: 'Análisis no disponible' };
    }

    const cleanCode = parsingCode.replace(/-/g, '');
    const descriptionParts = [];

    // Mapas de equivalencias morfológicas
    const personMap = { '1': '1 Persona', '2': '2 Persona', '3': '3 Persona' };
    const tenseMap = { 'P': 'Presente', 'I': 'Imperfecto', 'F': 'Futuro', 'A': 'Aoristo', 'R': 'Perfecto', 'L': 'Pluscuamperfecto' };
    const voiceMap = { 'A': 'Activo', 'M': 'Medio', 'P': 'Pasivo' };
    const moodMap = { 'I': 'Indicativo', 'S': 'Subjuntivo', 'O': 'Optativo', 'M': 'Imperativo', 'N': 'Infinitivo', 'P': 'Participio' };
    const numberMap = { 'S': 'Singular', 'P': 'Plural' };
    const caseMap = { 'N': 'Nominativo', 'G': 'Genitivo', 'D': 'Dativo', 'A': 'Acusativo', 'V': 'Vocativo' };
    const genderMap = { 'M': 'Masculino', 'F': 'Femenino', 'N': 'Neutro' };

    let code = parsingCode;
	let person = '', number = '', caseName = '', gender = '';

    // Lógica para Verbos (V-)
    if (pos.startsWith('V-')) {
        const mainPart = code.split('-')[0];
        const secondaryPart = code.split('-')[1] || '';
        let verbCode = mainPart;


						  
        if (personMap[verbCode[0]]) {
            person = personMap[verbCode[0]];
            verbCode = verbCode.substring(1);
        }

									
        if (tenseMap[verbCode[0]]) descriptionParts.push(tenseMap[verbCode[0]]);
        if (voiceMap[verbCode[1]]) descriptionParts.push(voiceMap[verbCode[1]]);
        if (moodMap[verbCode[2]]) descriptionParts.push(moodMap[verbCode[2]]);
        
						  
        if (person) descriptionParts.push(person);

						  
        if (numberMap[secondaryPart[0]]) descriptionParts.push(numberMap[secondaryPart[0]]);

												  
        if (verbCode.endsWith('P')) {
            if (caseMap[secondaryPart[1]]) descriptionParts.push(caseMap[secondaryPart[1]]);
            if (genderMap[secondaryPart[2]]) descriptionParts.push(genderMap[secondaryPart[2]]);
        }
    }
    // Lógica para Sustantivos, Adjetivos, Pronombres, Artículos
    else if (pos.startsWith('N-') || pos.startsWith('A-') || pos.startsWith('R') || pos.startsWith('D-') || pos.startsWith('P-')) {
        // CORRECCIÓN: Se usa 'cleanCode' directamente, que no tiene guiones.
        const mainPart = cleanCode; 
        if (caseMap[mainPart[0]]) descriptionParts.push(caseMap[mainPart[0]]);
        if (numberMap[mainPart[1]]) descriptionParts.push(numberMap[mainPart[1]]);
        if (genderMap[mainPart[2]]) descriptionParts.push(genderMap[mainPart[2]]);
    }

    return {
        cleanCode,
        description: descriptionParts.length > 0 ? descriptionParts.join(' ') : 'No se requiere análisis detallado'
    };
};


function AnalysisPopup({ wordData, onClose, onSave }) {
  // Estados del formulario
  const [strongs, setStrongs] = useState(wordData.strongs || '');
  const [userTranslation, setUserTranslation] = useState(wordData.user_translation || '');
  const [isEditing, setIsEditing] = useState(false);
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

  const handleToggleEdit = () => isEditing ? handleSave() : setIsEditing(true);

  const getFullPosName = (posAbbr) => {
    if (!posAbbr) return { abbr: '', name: 'No disponible' };
    const cleanAbbr = posAbbr.replace(/-/g, '');
    const legendEntry = legendData.find(item => item.abbr === posAbbr || item.abbr.slice(0, -1) === posAbbr.slice(0, -1));
    const fullName = legendEntry ? legendEntry.name : 'Desconocido';
    return { abbr: cleanAbbr, name: fullName };
  };

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
            <button onClick={handleToggleEdit} className="popup-edit-btn">
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