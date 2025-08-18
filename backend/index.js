require('dotenv').config();

//console.log("----- VARIABLES DE ENTORNO CARGADAS -----");
//console.log(process.env);
//console.log("-----------------------------------------");

const express = require('express');
const cors = require('cors');
const pool = require('./db');

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 4000;

// *******************************************************
// Descomentar esta linea cuando se haga pase a PRODUCCION
const path = require('path');
// *******************************************************

app.use(cors());
app.use(express.json());

// *******************************************************
// Descomentar esta linea cuando se haga pase a PRODUCCION
// --- INICIO: CÓDIGO PARA SERVIR EL FRONTEND --- 
// Sirve los archivos estáticos de la carpeta 'dist' de React
//app.use(express.static(path.join(__dirname, '../frontend/dist')));
// *******************************************************

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Formato: "Bearer TOKEN"

    if (token == null) return res.sendStatus(401); // No hay token

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403); // Token inválido o expirado
        req.user = user; // Guardamos los datos del usuario en el objeto de la petición
        next(); // Continuar a la ruta protegida
    });
}

// --- Rutas existentes ---
app.get('/api', (req, res) => {
  res.json({ message: "¡El backend está funcionando correctamente! 🚀" });
});

app.get('/api/db-test', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()'); // Consulta la hora actual de la BD
    res.json({
      message: '¡Conexión a la base de datos exitosa! ✅',
      db_time: result.rows[0].now,
    });
  } catch (err) {
    console.error('Error al conectar con la base de datos', err);
    res.status(500).json({ message: 'Error en la conexión a la base de datos ❌' });
  }
});

// RUTA DE REGISTRO DE NUEVO USUARIO
app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos.' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        
        const newUserQuery = `
            INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id, username;
        `;
        const result = await pool.query(newUserQuery, [username, passwordHash]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        // Manejar error de usuario duplicado (código 23505 en PostgreSQL)
        if (err.code === '23505') {
            return res.status(409).json({ message: 'El nombre de usuario ya existe.' });
        }
        console.error('Error al registrar usuario:', err);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

// RUTA DE LOGIN
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
        if (result.rows.length === 0) {
            return res.status(401).json({ message: 'Credenciales inválidas.' }); // Usuario no encontrado
        }
        const user = result.rows[0];
        const isValidPassword = await bcrypt.compare(password, user.password_hash);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Credenciales inválidas.' }); // Contraseña incorrecta
        }
        // Crear el token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET, // ¡Crea esta variable en tu archivo .env!
            { expiresIn: '24h' }
        );
        res.json({ token, username: user.username });
    } catch (err) {
        console.error('Error en el login:', err);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

// RUTA PARA VERIFICAR UN TOKEN EXISTENTE
app.get('/api/auth/verify-token', authenticateToken, (req, res) => {
  // Si el middleware 'authenticateToken' pasa, significa que el token es válido.
  // Devolvemos la información del usuario contenida en el token.
  res.json({ 
      message: "Token válido.", 
      user: { userId: req.user.userId, username: req.user.username } 
  });
});

// RUTA PARA OBTENER UN SOLO VERSÍCULO
app.get('/api/verse/:bookName/:chapter/:verse', authenticateToken, async (req, res) => { // <-- Añadimos authenticateToken
  const { bookName, chapter, verse } = req.params;
  const userId = req.user.userId; // <-- Obtenemos el userId
  try {
    const query = `
      SELECT 
        w.word_id, w.text, w.lemma, w.pos, w.parsing, w.strongs,
        sl.transliteration, sl.gloss, sl.definition,
        ut.user_translation
      FROM words w
      JOIN books b ON w.book_id = b.book_id
      LEFT JOIN strongs_lexicon sl ON w.strongs = sl.strongs_id
      LEFT JOIN user_translations ut ON w.word_id = ut.word_id AND ut.user_id = $4
      WHERE b.name = $1 AND w.chapter = $2 AND w.verse = $3
      ORDER BY w.position_in_verse;
    `;
    const result = await pool.query(query, [bookName, chapter, verse, userId]); // <-- Pasamos userId como 4to parámetro
    
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

app.patch('/api/translation/:wordId', authenticateToken, async (req, res) => {
    
    const { wordId } = req.params;
    const { user_translation } = req.body;
    const userId = req.user.userId; // Obtenemos el ID del token

    try {
        const query = `
            INSERT INTO user_translations (word_id, user_translation, user_id)
            VALUES ($1, $2, $3)
            ON CONFLICT (word_id, user_id) 
            DO UPDATE SET user_translation = $2;
        `;
        await pool.query(query, [wordId, user_translation, userId]);
        res.json({ message: 'Traducción guardada.' });
    } catch (err) {
        console.error('Error al guardar la traducción:', err);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

// --- RUTA PARA ACTUALIZAR EL ANÁLISIS MORFOLÓGICO DE UNA PALABRA ---
app.patch('/api/word/parsing/:wordId', authenticateToken, async (req, res) => {
    const { wordId } = req.params;
    const { parsing } = req.body;

    // Validación para asegurar que se envía un código de análisis
    if (typeof parsing !== 'string') {
        return res.status(400).json({ message: 'El código de análisis morfológico (parsing) es requerido.' });
    }

    try {
        await pool.query('UPDATE words SET parsing = $1 WHERE word_id = $2', [parsing, wordId]);
        res.json({ message: 'Análisis morfológico actualizado correctamente.' });
    } catch (err) {
        console.error('Error al actualizar el análisis morfológico:', err);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

// --- RUTA PARA OBTENER UN CAPÍTULO COMPLETO ---
app.get('/api/chapter/:bookName/:chapter', authenticateToken, async (req, res) => { // <-- Añadimos authenticateToken
  const { bookName, chapter } = req.params;
  const userId = req.user.userId; // <-- Obtenemos el userId
  try {
    const query = `
      SELECT 
        w.word_id, w.verse, w.text, w.lemma, w.pos, w.parsing, w.strongs,
        sl.transliteration, sl.gloss, sl.definition,
        ut.user_translation
      FROM words w
      JOIN books b ON w.book_id = b.book_id
      LEFT JOIN strongs_lexicon sl ON w.strongs = sl.strongs_id
      LEFT JOIN user_translations ut ON w.word_id = ut.word_id AND ut.user_id = $3
      WHERE b.name = $1 AND w.chapter = $2
      ORDER BY w.verse, w.position_in_verse;
    `;
    const result = await pool.query(query, [bookName, chapter, userId]);
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
app.get('/api/passage/:range', authenticateToken, async (req, res) => { 
  const { range } = req.params;
  const userId = req.user.userId; // <-- Obtenemos el userId
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
      SELECT w.word_id, w.verse, w.text, w.lemma, w.pos, w.parsing, w.strongs, sl.gloss, sl.transliteration, sl.definition, ut.user_translation
      FROM words w
      JOIN books b ON w.book_id = b.book_id
      LEFT JOIN strongs_lexicon sl ON w.strongs = sl.strongs_id
      LEFT JOIN user_translations ut ON w.word_id = ut.word_id AND ut.user_id = $5
      WHERE b.name = $1 AND w.chapter = $2 AND w.verse BETWEEN $3 AND $4
      ORDER BY w.verse, w.position_in_verse;
    `;
    const result = await pool.query(query, [correctBookName, chapter, startVerse, endVerse, userId]);
    const verses = result.rows.reduce((acc, row) => {
      if (!acc[row.verse]) { acc[row.verse] = { verse: row.verse, words: [] }; }
      acc[row.verse].words.push({ 
        id: row.word_id, 
        text: row.text, 
        lemma: row.lemma, 
        pos: row.pos, 
        parsing: row.parsing, 
        strongs: row.strongs, 
        gloss: row.gloss,
        transliteration: row.transliteration,
        definition: row.definition,
        user_translation: row.user_translation
      });
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

// --- ENDPOINTS PARA NOTAS DE ESTUDIO ---
app.get('/api/notes/:reference', authenticateToken, async (req, res) => {
  const { reference } = req.params;
  const userId = req.user.userId; // Obtenemos el ID del token

  try {
    const result = await pool.query('SELECT content FROM study_notes WHERE reference = $1 AND user_id = $2', [reference, userId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ content: '' }); 
    }
  } catch (err) {
    console.error('Error al obtener notas:', err);
    res.status(500).send('Error en el servidor');
  }
});

app.post('/api/notes', authenticateToken, async (req, res) => {
  const userId = req.user.userId; // Obtenemos el ID del token
  const { reference, content } = req.body;

  if (!reference || content === undefined || content === null) {
    return res.status(400).send('La referencia y el contenido son requeridos.');
  }
  try {
    const query = `
      INSERT INTO study_notes (reference, content, user_id, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (reference, user_id)
      DO UPDATE SET content = $2, updated_at = NOW();
    `;
    await pool.query(query, [reference, content, userId]);
    res.status(200).json({ message: 'Notas guardadas correctamente.' });
  } catch (err) {
    console.error('Error al guardar notas:', err);
    res.status(500).send('Error en el servidor');
  }
});

// --- ENDPOINTS PARA DIAGRAMAS SINTÁCTICOS ---
app.get('/api/diagrams/:reference', authenticateToken, async (req, res) => {
  
  const { reference } = req.params;
  const userId = req.user.userId; // Obtenemos el ID del token

  try {
    const result = await pool.query('SELECT nodes, edges FROM diagrams WHERE reference = $1 AND user_id = $2', [reference, userId]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ message: 'Diagrama no encontrado para esta referencia.' }); 
    }
  } catch (err) {
    console.error('Error al obtener el diagrama:', err);
    res.status(500).json({ message: 'Error en el servidor al obtener el diagrama.' });
  }
});

app.post('/api/diagrams', authenticateToken, async (req, res) => {
  
  const { reference, nodes, edges } = req.body;
  const userId = req.user.userId; // Obtenemos el ID del token

  if (!reference || !nodes || !edges) {
    return res.status(400).json({ message: 'La referencia, los nodos y las conexiones son requeridos.' });
  }
  try {
    const query = `
      INSERT INTO diagrams (reference, nodes, edges, user_id, updated_at)
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT (reference, user_id)
      DO UPDATE SET 
        nodes = EXCLUDED.nodes, 
        edges = EXCLUDED.edges, 
        updated_at = NOW();
    `;
    await pool.query(query, [reference, JSON.stringify(nodes), JSON.stringify(edges), userId]);
    res.status(200).json({ message: 'Diagrama guardado correctamente.' });
  } catch (err) {
    console.error('Error al guardar el diagrama:', err);
    res.status(500).json({ message: 'Error en el servidor al guardar el diagrama.' });
  }
});

// =======================================================
// --- NUEVOS ENDPOINTS PARA CONCORDANCIA ---
// =======================================================

// 1. OBTENER ESTADÍSTICAS DE FRECUENCIA
app.get('/api/word/stats/:lemma/:text', async (req, res) => {
    const { lemma, text } = req.params;
    try {
        const lemmaQuery = "SELECT count(*) FROM words WHERE lemma = $1";
        const textQuery = "SELECT count(*) FROM words WHERE text = $1";

        const [lemmaResult, textResult] = await Promise.all([
            pool.query(lemmaQuery, [lemma]),
            pool.query(textQuery, [text])
        ]);

        res.json({
            lemmaCount: parseInt(lemmaResult.rows[0].count, 10),
            textCount: parseInt(textResult.rows[0].count, 10)
        });
    } catch (err) {
        console.error('Error al obtener estadísticas de la palabra:', err);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

// 2. OBTENER CONCORDANCIA DE UNA PALABRA POR LEMA Y TEXTO
app.get('/api/word/concordance/:lemma/:text', async (req, res) => {
    const { lemma, text } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const offset = (page - 1) * limit;

    try {
        // 1. Llamamos a la función de conteo
        const countResult = await pool.query('SELECT * FROM get_concordance_count($1, $2)', [lemma, text]);
        const totals = {
            lemma: parseInt(countResult.rows[0].lemma_count, 10),
            text: parseInt(countResult.rows[0].text_count, 10)
        };

        // 2. Llamamos a la función de paginación
        const allWordsResult = await pool.query('SELECT * FROM get_concordance_page($1, $2, $3, $4)', [lemma, text, limit, offset]);
        
        // 3. El código de procesamiento en Node.js se mantiene, ya que funciona bien
        const versesMap = allWordsResult.rows.reduce((acc, row) => {
            const key = (row.book_name || 'Libro Desconocido') + ` ${row.chapter}:${row.verse}`;
            if (!acc[key]) { acc[key] = { reference: key, words: [] }; }
            acc[key].words.push({ text: row.word_text, lemma: row.word_lemma, parsing: row.word_parsing || '---' });
            return acc;
        }, {});

        const lemmaOccurrences = [];
        const textOccurrences = [];

        Object.values(versesMap).forEach(verse => {
            verse.words.forEach((word, index) => {
                const contextWords = 3;
                if (word.lemma === lemma) {
                    const start = Math.max(0, index - contextWords);
                    const end = Math.min(verse.words.length, index + contextWords + 1);
                    lemmaOccurrences.push({ reference: verse.reference, context: verse.words.slice(start, end) });
                }
                if (word.text === text) {
                    const start = Math.max(0, index - contextWords);
                    const end = Math.min(verse.words.length, index + contextWords + 1);
                    textOccurrences.push({ reference: verse.reference, context: verse.words.slice(start, end) });
                }
            });
        });

        res.json({ lemmaOccurrences, textOccurrences, totals });

    } catch (err) {
        console.error('Error al obtener la concordancia:', err);
        res.status(500).json({ message: 'Error en el servidor.' });
    }
});

// ********************************************************************
// Descomentar estas lineas cuando se habilite el pase a PRODUCCION
// --- FIN: CÓDIGO PARA SERVIR EL FRONTEND ---
// Este "catch-all" debe ir al final, después de las rutas API.
// Se asegura de que React Router maneje las rutas del frontend.
//app.get(/.*/, (req, res) => {
//  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
//});
// ********************************************************************

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
});
