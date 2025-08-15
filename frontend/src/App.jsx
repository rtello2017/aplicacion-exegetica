import {lazy, Suspense} from 'react'

import './App.css';
import './components/TextViewer.css';
import './components/Legend.css';
import './components/StudyNotes.css';

// Importamos el nuevo LanguageProvider
import { LanguageProvider } from './context/LanguageContext';
import LoginPage from './components/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

// ✅ Carga perezosa del componente principal de la aplicación
const DiagramApp = lazy(() => import('./DiagramApp'));

export default function App() {
  return (
    // El LanguageProvider envuelve todo para que el contexto esté disponible en todas las páginas
    <LanguageProvider>
      {/* BrowserRouter activa el sistema de rutas */}
      <BrowserRouter>
        {/* Routes define el conjunto de rutas posibles */}
        <Suspense fallback={<div>Cargando aplicación...</div>}>
        <Routes>
          {/* Ruta para la página de login */}
          <Route path="/login" element={<LoginPage />} />
          
          {/* Ruta principal, protegida */}
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                {/* DiagramApp solo se renderiza si el usuario está autenticado */}
                <DiagramApp />
              </ProtectedRoute>
            } 
          />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </LanguageProvider>
  );
}