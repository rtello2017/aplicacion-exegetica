const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const pool = require('../db');

const importLexicon = async () => {
  const client = await pool.connect();
  try {
    console.log('--- Iniciando importación del léxico de Strong ---');
    console.log('Leyendo el archivo strongsgreek.xml...');
    const xmlData = fs.readFileSync(path.join(__dirname, '../data/strongsgreek.xml'), 'utf8');

    console.log('Parseando el diccionario XML...');
    const parser = new xml2js.Parser({ explicitArray: false, mergeAttrs: true });
    const result = await parser.parseStringPromise(xmlData);

    const entries = result.strongsdictionary.entries.entry;
    console.log(`Se encontraron ${entries.length} entradas en el diccionario. Importando...`);

    for (const entry of entries) {
      const strongsId = parseInt(String(entry.strongs).replace('G', ''));

      // --- VERIFICACIÓN DE ROBUSTEZ AÑADIDA ---
      // Solo procesamos la entrada si tiene un ID de Strong válido Y una etiqueta <greek>
      if (!isNaN(strongsId) && entry.greek) {
        const lemma = entry.greek.unicode;
        const transliteration = entry.greek.translit;
        // Usamos || '' para proveer un valor por defecto si las etiquetas no existen
        const gloss = entry.kjv_def || '';
        const definition = entry.strongs_def || '';

        await client.query(
          `INSERT INTO strongs_lexicon (strongs_id, lemma, transliteration, gloss, definition)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (strongs_id) DO NOTHING`,
          [
            strongsId,
            lemma,
            transliteration,
            gloss,
            definition
          ]
        );
      }
    }

    console.log('--- ¡Importación del léxico de Strong completada! ---');
  } catch (err) {
    console.error('Error durante la importación del léxico:', err);
  } finally {
    client.release();
    //await pool.end();
  }
};

module.exports = importLexicon; // <-- AÑADE ESTA LÍNEA