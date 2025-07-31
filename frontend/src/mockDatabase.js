// Este objeto simula nuestra base de datos de versículos.
export const db = {
  juan: {
    '1': {
      '1': {
        reference: "Juan 1:1",
        words: [
          { id: 1, text: 'Ἐν' }, { id: 2, text: 'ἀρχῇ' }, { id: 3, text: 'ἦν' }, { id: 4, text: 'ὁ' }, { id: 5, text: 'Λόγος,' }, { id: 6, text: 'καὶ' }, { id: 7, text: 'ὁ' }, { id: 8, text: 'Λόγος' }, { id: 9, text: 'ἦν' }, { id: 10, text: 'πρὸς' }, { id: 11, text: 'τὸν' }, { id: 12, text: 'Θεόν,' }, { id: 13, text: 'καὶ' }, { id: 14, text: 'Θεὸς' }, { id: 15, text: 'ἦν' }, { id: 16, text: 'ὁ' }, { id: 17, text: 'Λόγos.' },
        ]
      },
      '2': {
        reference: "Juan 1:2",
        words: [
            { id: 1, text: 'οὗτος' }, { id: 2, text: 'ἦν' }, { id: 3, text: 'ἐν' }, { id: 4, text: 'ἀρχῇ' }, { id: 5, text: 'πρὸς' }, { id: 6, text: 'τὸν' }, { id: 7, text: 'θεόν.' }
        ]
      }
    }
  },
  mateo: {
    '3': {
      '2': {
        reference: "Mateo 3:2",
        words: [
            { id: 1, text: 'Μετανοεῖτε,' }, { id: 2, text: 'ἤγγικεν' }, { id: 3, text: 'γὰρ' }, { id: 4, text: 'ἡ' }, { id: 5, text: 'βασιλεία' }, { id: 6, text: 'τῶν' }, { id: 7, text: 'οὐρανῶν.' }
        ]
      }
    }
  }
};