const pool = require('../db');

const createTables = async () => {
  const client = await pool.connect();
  try {
    console.log('--- Iniciando migración de la base de datos ---');

    console.log('1. Verificando tabla "books"...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS books (
        book_id SERIAL PRIMARY KEY,
        name VARCHAR(50) NOT NULL,
        testament VARCHAR(2) NOT NULL DEFAULT 'NT'
      );
    `);

    console.log('2. Verificando tabla "words"...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS words (
        word_id SERIAL PRIMARY KEY,
        book_id INTEGER NOT NULL REFERENCES books(book_id),
        chapter INTEGER NOT NULL,
        verse INTEGER NOT NULL,
        position_in_verse INTEGER NOT NULL,
        text VARCHAR(100) NOT NULL,
        lemma VARCHAR(100),
        pos VARCHAR(10),
        parsing VARCHAR(50)
      );
    `);

    // --- NUEVA ACCIÓN 1: Añadir columna "strongs" a la tabla "words" ---
    console.log('3. Verificando columna "strongs" en la tabla "words"...');
    const checkColumnQuery = "SELECT column_name FROM information_schema.columns WHERE table_name='words' AND column_name='strongs';";
    const colResult = await client.query(checkColumnQuery);
    if (colResult.rowCount === 0) {
      await client.query('ALTER TABLE words ADD COLUMN strongs INTEGER;');
      console.log('   -> Columna "strongs" añadida.');
    } else {
      console.log('   -> Columna "strongs" ya existe.');
    }

    // --- NUEVA ACCIÓN 2: Crear la tabla "strongs_lexicon" ---
    console.log('4. Verificando tabla "strongs_lexicon"...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS strongs_lexicon (
        lexicon_id SERIAL PRIMARY KEY,
        strongs_id INTEGER UNIQUE NOT NULL,
        lemma VARCHAR(100),
        transliteration VARCHAR(100),
        gloss TEXT,
        definition TEXT
      );
    `);
    console.log('Tabla "strongs_lexicon" lista.');

    // Dentro de la función createTables, después de la creación de 'strongs_lexicon'
    console.log('5. Verificando tabla "user_translations"...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS user_translations (
        translation_id SERIAL PRIMARY KEY,
        word_id INTEGER UNIQUE NOT NULL REFERENCES words(word_id),
        user_translation TEXT
      );
    `);
    console.log('Tabla "user_translations" lista.');

    console.log('\n--- Migración de la base de datos completada exitosamente ---');

  } catch (err) {
    console.error('ERROR DURANTE LA MIGRACIÓN:', err);
  } finally {
    client.release();
  }
};

createTables().then(() => {
  pool.end();
});