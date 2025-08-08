const pool = require('../db');
const greekWordList = require('../data/lexicon.js');

const updateWithStrongs = async () => {
  const client = await pool.connect();
  try {
    console.log('\n--- Fase 2: Actualizando con `unaccent` (Versión Definitiva) ---');
    
    const entries = Object.entries(greekWordList);
    console.log(`Se procesarán ${entries.length} entradas del léxico. Esto puede tardar...`);
    
    let processedCount = 0;
    let updatedCount = 0;
    const failedMatches = [];

    for (const [key, entry] of entries) {
      processedCount++;

      // La 'key' es nuestro lema ya normalizado desde el léxico (ej: "ααρων")
      const normalizedLemmaFromLexicon = key;

      if (entry.strong) {
        const strongNumber = parseInt(entry.strong);

        if (!isNaN(strongNumber)) {
          // MODIFICACIÓN FINAL:
          // Usamos la extensión unaccent() y LOWER(). Es más simple y robusto.
          const res = await client.query(
            `UPDATE words 
             SET strongs = $1 
             WHERE 
               -- Normaliza la columna de la BD para que coincida con nuestra clave
               LOWER(unaccent(replace(lemma, 'ς', 'σ'))) = LOWER(unaccent(replace($2, 'ς', 'σ')))
               AND strongs IS NULL`,
            [strongNumber, normalizedLemmaFromLexicon]
          );
          
          if (res.rowCount > 0) {
            updatedCount += res.rowCount;
          } else {
            if (failedMatches.length < 10) {
                failedMatches.push(entry.lemma || key);
            }
          }
        }
      }

      if (processedCount % 500 === 0) {
        console.log(` -> ${processedCount} de ${entries.length} lemas procesados...`);
      }
    }
    console.log(`\n--- Fase 2 Completada: ${updatedCount} registros de la tabla 'words' fueron actualizados. ---`);

    if (failedMatches.length > 0) {
        console.log('\n(Info) Algunos lemas del léxico no encontraron coincidencias. Ejemplos:');
        failedMatches.forEach(failed => console.log(` - ${failed}`));
    }

  } catch (err) {
    console.error('Error durante la actualización con números de Strong:', err);
  } finally {
    client.release();
  }
};

module.exports = updateWithStrongs;

if (require.main === module) {
  console.log('Ejecutando el script de actualización de Strongs de forma independiente...');
  
  updateWithStrongs()
    .catch(err => {
        console.error('Ocurrió un error al ejecutar el script directamente:', err);
    })
    .finally(() => {
      console.log('Proceso finalizado. Cerrando conexión a la base de datos.');
      pool.end();
    });
}