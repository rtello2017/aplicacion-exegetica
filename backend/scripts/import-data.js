const fs = require('fs');
const path = require('path');
const pool = require('../db');

// ... (el bookMap se queda igual)
const bookMap = {
  '61': { id: 1, name: 'Matthew' },
  '62': { id: 2, name: 'Mark' },
  '63': { id: 3, name: 'Luke' },
  '64': { id: 4, name: 'John' },
  '65': { id: 5, name: 'Acts' },
  '66': { id: 6, name: 'Romans' },
  '67': { id: 7, name: '1 Corinthians' },
  '68': { id: 8, name: '2 Corinthians' },
  '69': { id: 9, name: 'Galatians' },
  '70': { id: 10, name: 'Ephesians' },
  '71': { id: 11, name: 'Philippians' },
  '72': { id: 12, name: 'Colossians' },
  '73': { id: 13, name: '1 Thessalonians' },
  '74': { id: 14, name: '2 Thessalonians' },
  '75': { id: 15, name: '1 Timothy' },
  '76': { id: 16, name: '2 Timothy' },
  '77': { id: 17, name: 'Titus' },
  '78': { id: 18, name: 'Philemon' },
  '79': { id: 19, name: 'Hebrews' },
  '80': { id: 20, name: 'James' },
  '81': { id: 21, name: '1 Peter' },
  '82': { id: 22, name: '2 Peter' },
  '83': { id: 23, name: '1 John' },
  '84': { id: 24, name: '2 John' },
  '85': { id: 25, name: '3 John' },
  '86': { id: 26, name: 'Jude' },
  '87': { id: 27, name: 'Revelation' }
};

const importData = async () => {
  const client = await pool.connect();
  try {
    console.log('--- Fase 1: Importando Texto Base desde archivos .txt ---');

    console.log('Limpiando tablas (books, words)...');
    await client.query('TRUNCATE TABLE books, words RESTART IDENTITY CASCADE;');

    console.log('Insertando libros...');
    for (const book of Object.values(bookMap)) {
        await client.query('INSERT INTO books (book_id, name) VALUES ($1, $2) ON CONFLICT (book_id) DO NOTHING', [book.id, book.name]);
    }
    console.log('Libros insertados.');

    const dataDir = path.join(__dirname, '../data');
//    const files = fs.readdirSync(dataDir).filter(f => f.endsWith('.txt'));
    const files = fs.readdirSync(dataDir).filter(f => /^\d{2}.*\.txt$/.test(f));

    for (const file of files) {
      const bookNumber = file.substring(0, 2);
      const bookId = bookMap[bookNumber].id;
      console.log(`Procesando libro: ${bookMap[bookNumber].name}...`);

      const fileContent = fs.readFileSync(path.join(dataDir, file), 'utf8');
      const lines = fileContent.split('\n');
      let wordPosition = 1;
      let currentVerse = null;

      for (const line of lines) {
        if (!line.trim()) continue;
        const parts = line.split(/\s+/);
        const bcv = parts[0];
        const pos = parts[1]; // Columna 2: El POS Tag (RA, N-, V-)
        const parsing = parts[2]; // Columna 3: Los detalles (----ASM-, 1AMI-S--)
        const text = parts[3];
        const lemma = parts[6];
        const chapter = parseInt(bcv.substring(2, 4), 10);
        const verse = parseInt(bcv.substring(4, 6), 10);

        if (currentVerse !== verse) {
          currentVerse = verse;
          wordPosition = 1;
        }

        await client.query(
          `INSERT INTO words (book_id, chapter, verse, position_in_verse, text, lemma, pos, parsing)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [bookId, chapter, verse, wordPosition, text, lemma, pos, parsing]
        );
        wordPosition++;
      }
    }
    console.log('¡Importación de datos completada exitosamente!');
  } catch (err) {
    console.error('Error durante la importación:', err);
  } finally {
    console.log('Cerrando conexión...');
    client.release();
    //await pool.end();
  }
};

module.exports = importData;
