require('dotenv').config();
const express = require('express');
const cors = require('cors'); // <-- PASO 1: IMPORTAR CORS
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors()); // <-- PASO 2: USAR CORS
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

// --- NUEVA RUTA PARA OBTENER VERSÍCULOS ---
// Esta ruta usa parámetros: :bookName, :chapter, :verse
app.get('/api/verse/:bookName/:chapter/:verse', async (req, res) => {
  const { bookName, chapter, verse } = req.params;
  try {
    // La consulta ahora une las 3 tablas para obtener toda la información
    const query = `
      SELECT 
        w.word_id, w.text, w.lemma, w.pos, w.parsing, w.strongs,
        sl.transliteration, sl.gloss, sl.definition
      FROM words w
      JOIN books b ON w.book_id = b.book_id
      LEFT JOIN strongs_lexicon sl ON w.strongs = sl.strongs_id
      WHERE b.name = $1 AND w.chapter = $2 AND w.verse = $3
      ORDER BY w.position_in_verse;
    `;

    const result = await pool.query(query, [bookName, chapter, verse]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Versículo no encontrado.' });
    }

    // El objeto de respuesta ahora incluye los nuevos campos
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
        gloss: row.gloss, // La traducción corta
        definition: row.definition // La definición larga
      }))
    };

    res.json(responseData);
  } catch (err) {
    console.error(`Error al obtener el versículo ${bookName} ${chapter}:${verse}`, err);
    res.status(500).json({ message: 'Error en el servidor al obtener el versículo.' });
  }
});

// --- NUEVAS RUTAS PARA POBLAR LOS SELECTORES ---

// Ruta para obtener todos los libros
app.get('/api/books', async (req, res) => {
  try {
    const result = await pool.query('SELECT book_id, name FROM books ORDER BY book_id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener los libros', err);
    res.status(500).json({ message: 'Error en el servidor.' });
  }
});

// Ruta para obtener el número de capítulos de un libro
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

// Ruta para obtener el número de versículos de un capítulo/libro
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


app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});