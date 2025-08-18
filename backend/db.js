// Importa la librería de node-postgres (pg)
const { Pool } = require('pg');
// Importa y configura dotenv para leer tu archivo .env en local
require('dotenv').config();

// Objeto para la configuración de la conexión
let dbConfig;

// Condición: ¿Existe la variable de entorno DATABASE_URL (provista por Render)?
if (process.env.DATABASE_URL) {
  // Sí, estamos en producción (Render).
  console.log('Entorno de producción detectado. Usando DATABASE_URL con SSL.');
  dbConfig = {
    connectionString: process.env.DATABASE_URL,
    // --- ESTA ES LA MODIFICACIÓN CRÍTICA PARA RENDER ---
    // Render requiere conexiones seguras (SSL) para sus bases de datos.
    ssl: {
      rejectUnauthorized: false
    }
  };
} else {
  // No, estamos en desarrollo (local).
  console.log('Entorno de desarrollo detectado. Usando variables de .env.');
  dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  };
}

// Crea una nueva instancia del Pool con la configuración decidida
const pool = new Pool(dbConfig);

// Exporta el pool para poder usarlo en otras partes de tu aplicación
module.exports = pool;
