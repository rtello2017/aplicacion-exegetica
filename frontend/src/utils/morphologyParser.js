// Leyenda para las categorías gramaticales
const legendData = [
    { abbr: 'N-', name: 'Sustantivo (Noun)' },
    { abbr: 'V-', name: 'Verbo (Verb)' },
    { abbr: 'A-', name: 'Adjetivo (Adjective)' },
    { abbr: 'P-', name: 'Pronombre Personal' },
    { abbr: 'RP', name: 'Pronombre Relativo' },
    { abbr: 'RA', name: 'Pronombre Demostrativo' },
    { abbr: 'RD', name: 'Pronombre Indefinido' },
    { abbr: 'RI', name: 'Pronombre Interrogativo' },
    { abbr: 'D-', name: 'Artículo Definido' },
    { abbr: 'C-', name: 'Conjunción (Conjunction)' },
    { abbr: 'RR', name: 'Adverbio (Adverb)' },
    { abbr: 'I-', name: 'Interjección (Interjection)' },
    { abbr: 'X-', name: 'Partícula (Particle)' },
    { abbr: 'ADV', name: 'Adverbio (Adverb)' },
    { abbr: 'CONJ', name: 'Conjunción (Conjunction)' },
    { abbr: 'PRT', name: 'Partícula (Particle)' },
    { abbr: 'PREP', name: 'Preposición (Preposition)' },
];

// Mapas de equivalencias morfológicas
const personMap = { '1': '1 Persona', '2': '2 Persona', '3': '3 Persona' };
const tenseMap = { 'P': 'Presente', 'I': 'Imperfecto', 'F': 'Futuro', 'A': 'Aoristo', 'R': 'Perfecto', 'L': 'Pluscuamperfecto' };
const voiceMap = { 'A': 'Activo', 'M': 'Medio', 'P': 'Pasivo' };
const moodMap = { 'I': 'Indicativo', 'S': 'Subjuntivo', 'O': 'Optativo', 'M': 'Imperativo', 'N': 'Infinitivo', 'P': 'Participio' };
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

export const parseDetailedMorphology = (parsingCode, pos) => {
    if (!parsingCode || !pos) {
        return { cleanCode: parsingCode || '', description: 'Análisis no disponible' };
    }
    const cleanCode = parsingCode.replace(/-/g, '');
    const descriptionParts = [];

    if (pos.startsWith('V-')) {
        const mainPart = parsingCode.split('-')[0];
        const secondaryPart = parsingCode.split('-')[1] || '';
        let verbCode = mainPart;
        let person = '';
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
    else if (pos.startsWith('N-') || pos.startsWith('A-') || pos.startsWith('R') || pos.startsWith('D-') || pos.startsWith('P-')) {
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