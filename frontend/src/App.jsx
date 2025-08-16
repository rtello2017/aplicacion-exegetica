import {lazy, Suspense, useContext} from 'react'

import './App.css';
import './components/TextViewer.css';
import './components/Legend.css';
import './components/StudyNotes.css';

// Importamos el nuevo LanguageProvider
import { LanguageProvider } from './context/LanguageContext';
import { AuthContext } from './context/AuthContext';  
import LoginPage from './components/LoginPage';
import { Routes, Route, Navigate } from 'react-router-dom';

// ✅ Carga perezosa del componente principal de la aplicación
const DiagramApp = lazy(() => import('./DiagramApp'));

export default function App() {
  const { user } = useContext(AuthContext);
  
  return (
    // El LanguageProvider envuelve todo para que el contexto esté disponible en todas las páginas
    <LanguageProvider>
      <Suspense fallback={<div>Cargando aplicación...</div>}>
        <Routes>
          {/* Si el usuario NO está logueado, la ruta raíz lo lleva al login */}
          <Route 
            path="/" 
            element={!user ? <Navigate to="/login" /> : <DiagramApp />} 
          />
          
          {/* Si el usuario SÍ está logueado, la ruta /login lo redirige a la app */}
          <Route 
            path="/login" 
            element={!user ? <LoginPage /> : <Navigate to="/" />} 
          />
        </Routes>
      </Suspense>
    </LanguageProvider>
  );
}