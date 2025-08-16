import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // AÑADE ESTA SECCIÓN
  server: {
    proxy: {
      // Cualquier petición que empiece con /api
      '/api': {
        // Será redirigida a tu backend
        target: 'http://localhost:4000', // Asegúrate de que este es el puerto de tu backend
        changeOrigin: true,
      }
    }
  }
})