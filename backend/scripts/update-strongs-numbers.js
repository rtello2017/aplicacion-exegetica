const pool = require('../db');
const lexicon = require('../data/lexicon.js');

const updateWithStrongs = async () => {
  const client = await pool.connect();
  try {
    console.log('\n--- Fase 2: Enriqueciendo la base de datos con números de Strong ---');
    const entries = Object.values(lexicon);
    console.log(`Se procesarán ${entries.length} entradas del léxico. Esto puede tardar...`);
    let processedCount = 0;

    for (const entry of entries) {
      processedCount++; // Incrementamos el contador aquí para que el log sea más preciso

      // Verificamos que las propiedades necesarias existan
      if (entry.lemma && entry.strong) {
        const strongNumber = parseInt(entry.strong);

        // --- PASO DE VALIDACIÓN CLAVE ---
        // Solo ejecutamos la consulta si `parseInt` nos devolvió un número válido
        if (!isNaN(strongNumber)) {
          await client.query(
            'UPDATE words SET strongs = $1 WHERE lemma = $2',
            [strongNumber, entry.lemma]
          );
        }
        // Si no es un número válido, simplemente lo ignoramos y continuamos.
      }

      if (processedCount % 500 === 0) {
        console.log(` -> ${processedCount} de ${entries.length} lemas procesados...`);
      }
    }
    console.log('--- Fase 2 Completada: Números de Strong actualizados. ---');
  } catch (err) {
    console.error('Error durante la actualización con números de Strong:', err);
  } finally {
    client.release();
  }
};

module.exports = updateWithStrongs;