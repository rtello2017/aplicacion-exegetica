const partOfSpeechMap = { 'N-': 'Sustantivo', 'V-': 'Verbo', 'A-': 'Adjetivo', 'P-': 'Pronombre Personal', 'R-': 'Preposición', 'C-': 'Conjunción', 'D-': 'Adverbio', 'I-': 'Interjección', 'X-': 'Partícula', 'RA': 'Artículo', 'RR': 'Pronombre Relativo', 'RP': 'Pronombre Personal', 'RD': 'Pronombre Demostrativo' };
const personMap = { '1': '1ra Persona', '2': '2da Persona', '3': '3ra Persona' };
const numberMap = { 'S': 'Singular', 'P': 'Plural' };
const tenseMap = { 'P': 'Presente', 'I': 'Imperfecto', 'F': 'Futuro', 'A': 'Aoristo', 'R': 'Perfecto', 'Y': 'Pluscuamperfecto' };
const voiceMap = { 'A': 'Activa', 'M': 'Media', 'P': 'Pasiva' };
const moodMap = { 'I': 'Indicativo', 'D': 'Imperativo', 'S': 'Subjuntivo', 'O': 'Optativo', 'N': 'Infinitivo', 'P': 'Participio' };
const caseMap = { 'N': 'Nominativo', 'G': 'Genitivo', 'D': 'Dativo', 'A': 'Acusativo', 'V': 'Vocativo' };
const genderMap = { 'M': 'Masculino', 'F': 'Femenino', 'N': 'Neutro' };

export const translateParsingCode = (pos, parsing) => {
  if (!pos || !parsing) return 'Análisis no disponible';

  const descriptions = [partOfSpeechMap[pos] || pos];

  // El código de parsing es una cadena de 8 caracteres. ej: ----ASM- o 1AMI-S--
  // La posición de cada letra indica una característica.
  const person = personMap[parsing[0]];
  const tense = tenseMap[parsing[1]];
  const voice = voiceMap[parsing[2]];
  const mood = moodMap[parsing[3]];
  const p_case = caseMap[parsing[4]];
  const number = numberMap[parsing[5]];
  const gender = genderMap[parsing[6]];
  // parsing[7] es el guion final, lo ignoramos

  if (person && person !== '-') descriptions.push(person);
  if (tense && tense !== '-') descriptions.push(tense);
  if (voice && voice !== '-') descriptions.push(voice);
  if (mood && mood !== '-') descriptions.push(mood);
  if (p_case && p_case !== '-') descriptions.push(p_case);
  if (number && number !== '-') descriptions.push(number);
  if (gender && gender !== '-') descriptions.push(gender);

  return descriptions.join(', ');
};

// Añade esta función al final de parsingHelper.js
export const generateShortCode = (pos, parsing) => {
  if (!pos || !parsing) return '';

  const details = [];

  switch (pos) {
    case 'V-': // Verbos
      // Tense, Voice, Mood, Person, Number
      details.push(parsing[1], parsing[2], parsing[3], parsing[4], parsing[5]);
      break;
    case 'N-': // Sustantivos
    case 'A-': // Adjetivos
    case 'RA': // Artículos
    case 'P-': // Pronombres (y sus variantes)
    case 'RP':
    case 'RR':
    case 'RD':
      // Case, Number, Gender
      details.push(parsing[4], parsing[5], parsing[6]);
      break;
    default:
      return pos.replace('-', ''); // Para conjunciones, etc., solo muestra el POS.
  }

  return `${pos.replace('-', '')}-${details.join('')}`;
};