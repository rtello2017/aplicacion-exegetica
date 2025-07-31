const pool = require('../db');
const importData = require('./import-data.js');
const updateWithStrongs = require('./update-strongs-numbers.js');
const importLexicon = require('./import-strongs-lexicon.js'); // <-- 1. IMPORTAR EL NUEVO SCRIPT

const main = async () => {
    console.log('--- INICIANDO PROCESO COMPLETO DE POBLADO DE BASE DE DATOS ---');

    await importData();       // Ejecuta la Fase 1
    await updateWithStrongs();    // Ejecuta la Fase 2
    await importLexicon();        // <-- 2. AÑADIR LA EJECUCIÓN DE LA FASE 3

    console.log('\n✅ Proceso de importación y actualización completado.');
    pool.end(); // Cierra la conexión una sola vez, al final de todo.
};

main();