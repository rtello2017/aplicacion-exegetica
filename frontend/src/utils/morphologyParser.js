// Leyenda para las categorías gramaticales
const legendData = [
    { abbr: 'N-', name: 'Sustantivo (Noun)' },
    { abbr: 'V-', name: 'Verbo (Verb)' },
    { abbr: 'A-', name: 'Adjetivo (Adjective)' },
    { abbr: 'P-', name: 'Preposición' },
    { abbr: 'RP', name: 'Pronombre Personal' },
    { abbr: 'RA', name: 'Artículo Definido' },
    { abbr: 'RD', name: 'Pronombre Demostrativo' },
    { abbr: 'RI', name: 'Pronombre Interrogativo / Indefinido' },
    { abbr: 'D-', name: 'Adverbio' },
    { abbr: 'C-', name: 'Conjunción (Conjunction)' },
    { abbr: 'RR', name: 'Pronombre Relativo' },
    { abbr: 'I-', name: 'Interjección (Interjection)' },
    { abbr: 'X-', name: 'Partícula (Particle)' },
    { abbr: 'ADV', name: 'Adverbio (Adverb)' },
    { abbr: 'CONJ', name: 'Conjunción (Conjunction)' },
    { abbr: 'PRT', name: 'Partícula (Particle)' },
    { abbr: 'PREP', name: 'Preposición (Preposition)' },
];

// Mapas de equivalencias morfológicas
const personMap = { '1': '1 Persona', '2': '2 Persona', '3': '3 Persona' };
const tenseMap = { 'P': 'Presente', 'I': 'Imperfecto', 'F': 'Futuro', 'A': 'Aoristo', 'R': 'Perfecto', 'Y': 'Pluscuamperfecto', 'X': 'Perfecto' };
const voiceMap = { 'A': 'Activo', 'M': 'Medio', 'P': 'Pasivo' };
const moodMap = { 'I': 'Indicativo', 'S': 'Subjuntivo', 'O': 'Optativo', 'M': 'Imperativo', 'N': 'Infinitivo', 'P': 'Participio', 'D': 'Imperativo' };
const numberMap = { 'S': 'Singular', 'P': 'Plural' };
const caseMap = { 'N': 'Nominativo', 'G': 'Genitivo', 'D': 'Dativo', 'A': 'Acusativo', 'V': 'Vocativo' };
const genderMap = { 'M': 'Masculino', 'F': 'Femenino', 'N': 'Neutro' };

export const getFullPosName = (posAbbr) => {
    if (!posAbbr) return { abbr: '', name: 'No disponible' };
    const cleanAbbr = posAbbr.replace(/-/g, '');
    const legendEntry = legendData.find(item => item.abbr === posAbbr || item.abbr.slice(0, -1) === posAbbr.slice(0, -1));
    const fullName = legendEntry ? legendEntry.name : 'Desconocido';
    return { abbr: cleanAbbr, name: fullName };
};

// En frontend/src/utils/morphologyParser.js

export const parseDetailedMorphology = (parsingCode, pos) => {
  if (!parsingCode || !pos) return { cleanCode: '', description: 'No disponible' };

  const code = parsingCode.replace(/-/g, '').toUpperCase();
  const mainPos = pos.split('-')[0].toUpperCase(); // Usamos el código POS completo (ej. 'RP', 'V')
  let parts = [];

  // Diccionarios (asegúrate de tenerlos definidos en tu archivo)
  const tenses = { A: 'Aoristo', P: 'Presente', F: 'Futuro', I: 'Imperfecto', R: 'Perfecto', L: 'Pluscuamperfecto', X: 'Perfecto' };
  // ✅ AÑADIDO: 'D' para Deponente
  const voices = { A: 'Activa', M: 'Media', P: 'Pasiva', D: 'Deponente' };
  const moods = { I: 'Indicativo', S: 'Subjuntivo', O: 'Optativo', M: 'Imperativo', N: 'Infinitivo', P: 'Participio', D: 'Imperativo' };
  const persons = { '1': '1ra Persona', '2': '2da Persona', '3': '3ra Persona' };
  const numbers = { S: 'Singular', P: 'Plural' };
  const cases = { N: 'Nominativo', G: 'Genitivo', D: 'Dativo', A: 'Acusativo', V: 'Vocativo' };
  const genders = { M: 'Masculino', F: 'Femenino', N: 'Neutro' };

  if (mainPos === 'V') { // Verbos
    const tense = tenses[code.charAt(0)];
    const voice = voices[code.charAt(1)];
    const mood = moods[code.charAt(2)];
    if (tense) parts.push(tense);
    if (voice) parts.push(voice);
    if (mood) parts.push(mood);

    const isParticiple = code.charAt(2) === 'P';

    if (isParticiple) {
      const caseVal = cases[code.charAt(3)];
      const numberVal = numbers[code.charAt(4)];
      const genderVal = genders[code.charAt(5)];
      if (numberVal) parts.push(numberVal);
      if (genderVal) parts.push(genderVal);
      if (caseVal) parts.push(caseVal);
    } else if (mood !== 'Infinitivo') {
      const person = persons[code.charAt(3)];
      const number = numbers[code.charAt(4)];
      if (person) parts.push(person);
      if (number) parts.push(number);
    }
  // ✅ MEJORADO: Ahora revisa una lista más amplia de tipos
  } else if (['N', 'A', 'P', 'D', 'RP', 'RA', 'RD', 'RI'].includes(mainPos)) {
    const caseVal = cases[code.charAt(0)];
    const numberVal = numbers[code.charAt(1)];
    const genderVal = genders[code.charAt(2)];
    if (caseVal) parts.push(caseVal);
    if (numberVal) parts.push(numberVal);
    if (genderVal) parts.push(genderVal);
  } else {
      return { cleanCode: parsingCode, description: 'No se requiere análisis detallado' };
  }

  // Si después de todo el análisis no se generó descripción, devuelve el mensaje por defecto
  if (parts.length === 0 && code.length > 0) {
      return { cleanCode: parsingCode, description: 'Análisis detallado no disponible para este código.' };
  }
  
  return {
    cleanCode: parsingCode,
    description: parts.join(' ')
  };
};