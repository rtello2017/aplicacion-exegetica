require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// --- Rutas existentes ---
app.get('/api', (req, res) => {
  res.json({ message: "¡El backend está funcionando correctamente! 🚀" });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      message: 'Conexión a la base de datos exitosa ✅',
      db_time: result.rows[0].now,
    });
  } catch (err) {
    console.error('Error al conectar con la base de datos', err);
    res.status(500).json({ message: 'Error en la conexión a la base de datos ❌' });
  }
});

// RUTA PARA OBTENER UN SOLO VERSÍCULO
app.get('/api/verse/:bookName/:chapter/:verse', async (req, res) => {
  const { bookName, chapter, verse } = req.params;
  try {
    const query = `
    SELECT 
      w.word_id, w.text, w.lemma, w.pos, w.parsing, w.strongs,
      sl.transliteration, sl.gloss, sl.definition,
      ut.user_translation
    FROM words w
    JOIN books b ON w.book_id = b.book_id
    LEFT JOIN strongs_lexicon sl ON w.strongs = sl.strongs_id
    LEFT JOIN user_translations ut ON w.word_id = ut.word_id
    WHERE b.name = $1 AND w.chapter = $2 AND w.verse = $3
    ORDER BY w.position_in_verse;
  `;
    const result = await pool.query(query, [bookName, chapter, verse]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Versículo no encontrado.' });
    }
    const responseData = {
      reference: `${bookName} ${chapter}:${verse}`,
      words: result.rows.map(row => ({
        id: row.word_id,
        text: row.text,
        lemma: row.lemma,
        pos: row.pos,
        parsing: row.parsing,
        strongs: row.strongs,
        transliteration: row.transliteration,
        gloss: row.gloss,
        definition: row.definition,
        user_translation: row.user_translation
      }))
    };
    res.json(responseData);
  } catch (err) {
    console.error(`Error al obtener el versículo ${bookName} ${chapter}:${verse}`, err);
    res.status(500).json({ message: 'Error en el servidor al obtener el versículo.' });
  }
});

// --- RUTAS PARA POBLAR LOS SELECTORES ---
app.get('/api/books', async (req, res) => {
  try {
    const result = await pool.query('SELECT book_id, name FROM books ORDER BY book_id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los libros', err);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

app.get('/api/chapters/:bookId', async (req, res) => {
  const { bookId } = req.params;
  try {
    const result = await pool.query('SELECT MAX(chapter) as chapter_count FROM words WHERE book_id = $1', [bookId]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener los capítulos', err);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

app.get('/api/verses/:bookId/:chapter', async (req, res) => {
  const { bookId, chapter } = req.params;
  try {
    const result = await pool.query('SELECT MAX(verse) as verse_count FROM words WHERE book_id = $1 AND chapter = $2', [bookId, chapter]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error al obtener los versículos', err);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// --- RUTAS DE ACTUALIZACIÓN (PATCH) ---
app.patch('/api/lexicon/:strongsId', async (req, res) => {
  const { strongsId } = req.params;
  const { transliteration, gloss, definition } = req.body;
  try {
    await pool.query(
      'UPDATE strongs_lexicon SET transliteration = $1, gloss = $2, definition = $3 WHERE strongs_id = $4',
      [transliteration, gloss, definition, strongsId]
    );
    res.json({ message: 'Léxico actualizado exitosamente.' });
  } catch (err) {
    console.error('Error al actualizar el léxico:', err);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

app.patch('/api/word/:wordId', async (req, res) => {
    const { wordId } = req.params;
    const { strongs } = req.body;
    try {
        await pool.query('UPDATE words SET strongs = $1 WHERE word_id = $2', [strongs, wordId]);
        res.json({ message: 'Nº de Strong actualizado.' });
    } catch (err) {
        console.error('Error al actualizar el Nº de Strong:', err);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

app.patch('/api/translation/:wordId', async (req, res) => {
    const { wordId } = req.params;
    const { user_translation } = req.body;
    try {
        const query = `
            INSERT INTO user_translations (word_id, user_translation)
            VALUES ($1, $2)
            ON CONFLICT (word_id) 
            DO UPDATE SET user_translation = $2;
        `;
        await pool.query(query, [wordId, user_translation]);
        res.json({ message: 'Traducción guardada.' });
    } catch (err) {
        console.error('Error al guardar la traducción:', err);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

// --- RUTA PARA OBTENER UN CAPÍTULO COMPLETO ---
app.get('/api/chapter/:bookName/:chapter', async (req, res) => {
  const { bookName, chapter } = req.params;
  try {
    const query = `
      SELECT 
        w.word_id, w.verse, w.text, w.lemma, w.pos, w.parsing, w.strongs,
        sl.transliteration, sl.gloss, sl.definition,
        ut.user_translation
      FROM words w
      JOIN books b ON w.book_id = b.book_id
      LEFT JOIN strongs_lexicon sl ON w.strongs = sl.strongs_id
      LEFT JOIN user_translations ut ON w.word_id = ut.word_id
      WHERE b.name = $1 AND w.chapter = $2
      ORDER BY w.verse, w.position_in_verse;
    `;
    const result = await pool.query(query, [bookName, chapter]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Capítulo no encontrado.' });
    }
    const verses = result.rows.reduce((acc, row) => {
      if (!acc[row.verse]) {
        acc[row.verse] = { verse: row.verse, words: [] };
      }
      acc[row.verse].words.push({
        id: row.word_id,
        text: row.text,
        lemma: row.lemma,
        pos: row.pos,
        parsing: row.parsing,
        strongs: row.strongs,
        transliteration: row.transliteration,
        gloss: row.gloss,
        definition: row.definition,
        user_translation: row.user_translation
      });
      return acc;
    }, {});
    const responseData = {
      reference: `${bookName} ${chapter}`,
      verses: Object.values(verses).sort((a, b) => a.verse - b.verse)
    };
    res.json(responseData);
  } catch (err) {
    console.error(`Error al obtener el capítulo ${bookName} ${chapter}`, err);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// --- RUTA PARA OBTENER RANGOS DE PASAJES ---
app.get('/api/passage/:range', async (req, res) => {
  const { range } = req.params;
  const singleVerseRegex = /(.+?)\s+(\d+):(\d+)$/;
  const verseRangeRegex = /(.+?)\s+(\d+):(\d+)-(\d+)$/;
  let bookName, chapter, startVerse, endVerse;
  let match = range.match(verseRangeRegex);
  if (match) {
    bookName = match[1].trim();
    chapter = parseInt(match[2]);
    startVerse = parseInt(match[3]);
    endVerse = parseInt(match[4]);
  } else {
    match = range.match(singleVerseRegex);
    if (match) {
      bookName = match[1].trim();
      chapter = parseInt(match[2]);
      startVerse = parseInt(match[3]);
      endVerse = startVerse;
    } else {
      return res.status(400).json({ message: 'Formato de pasaje no reconocido. Use "Libro C:V" o "Libro C:V-V".' });
    }
  }
  const bookResult = await pool.query('SELECT name FROM books WHERE name ILIKE $1', [bookName]);
  if (bookResult.rows.length === 0) {
      return res.status(404).json({ message: `Libro "${bookName}" no encontrado.` });
  }
  const correctBookName = bookResult.rows[0].name;
  try {
    const query = `
      SELECT w.word_id, w.verse, w.text, w.lemma, w.pos, w.parsing, w.strongs, sl.gloss, ut.user_translation
      FROM words w
      JOIN books b ON w.book_id = b.book_id
      LEFT JOIN strongs_lexicon sl ON w.strongs = sl.strongs_id
      LEFT JOIN user_translations ut ON w.word_id = ut.word_id
      WHERE b.name = $1 AND w.chapter = $2 AND w.verse BETWEEN $3 AND $4
      ORDER BY w.verse, w.position_in_verse;
    `;
    const result = await pool.query(query, [correctBookName, chapter, startVerse, endVerse]);
    const verses = result.rows.reduce((acc, row) => {
      if (!acc[row.verse]) { acc[row.verse] = { verse: row.verse, words: [] }; }
      acc[row.verse].words.push({ id: row.word_id, text: row.text, lemma: row.lemma, pos: row.pos, parsing: row.parsing, strongs: row.strongs, gloss: row.gloss, user_translation: row.user_translation });
      return acc;
    }, {});
    const responseData = {
      reference: range,
      verses: Object.values(verses).sort((a, b) => a.verse - b.verse)
    };
    res.json(responseData);
  } catch (err) {
    console.error(`Error al obtener el pasaje ${range}`, err);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// =======================================================
// --- NUEVOS ENDPOINTS PARA NOTAS DE ESTUDIO ---
// =======================================================

// 1. OBTENER NOTAS PARA UN PASAJE (GET)
app.get('/api/notes/:reference', async (req, res) => {
  const { reference } = req.params;
  try {
    const result = await pool.query('SELECT content FROM study_notes WHERE reference = $1', [reference]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]); // Devuelve { content: "..." }
    } else {
      // Si no hay notas, es importante devolver un objeto con la propiedad 'content' vacía
      res.json({ content: '' }); 
    }
  } catch (err) {
    console.error('Error al obtener notas:', err);
    res.status(500).send('Error en el servidor');
  }
});

// 2. GUARDAR/ACTUALIZAR NOTAS (POST)
app.post('/api/notes', async (req, res) => {
  const { reference, content } = req.body;

  if (!reference || content === undefined) {
    return res.status(400).send('La referencia y el contenido son requeridos.');
  }

  try {
    // Esta consulta usa "UPSERT": si la referencia existe, la actualiza (UPDATE).
    // Si no existe, la inserta (INSERT).
    const query = `
      INSERT INTO study_notes (reference, content, updated_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (reference)
      DO UPDATE SET content = $2, updated_at = NOW();
    `;
    await pool.query(query, [reference, content]);
    res.status(200).send('Notas guardadas correctamente.');
  } catch (err)
    {
    console.error('Error al guardar notas:', err);
    res.status(500).send('Error en el servidor');
  }
});


app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
