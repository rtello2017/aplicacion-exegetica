import React from 'react';
import { Navigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const ProtectedRoute = ({ children }) => {
  // ✅ 1. Obtén 'localized' del contexto junto con los demás valores.
  const { user, token, isAuthLoading, localized } = useLanguage();

  // Mientras se verifica el token, muestra un mensaje de carga.
  if (isAuthLoading) {
    // ✅ 2. Usa el texto desde el objeto 'localized'.
    return <div>{localized.ui.app.verifyingSession}</div>;
  }

  // Si terminó de cargar y NO hay token/usuario, redirige al login.
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Si todo está bien, muestra la aplicación.
  return children;
};

export default ProtectedRoute;