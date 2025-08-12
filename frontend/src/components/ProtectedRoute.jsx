import React from 'react';
import { Navigate } from 'react-router-dom';

// Este componente actúa como un "guardián" para tus rutas.
// Recibe como 'children' el componente que debe proteger (en tu caso, DiagramApp).
const ProtectedRoute = ({ children }) => {
  // 1. Revisa si existe un token en el almacenamiento local del navegador.
  const token = localStorage.getItem('token');

  // 2. Si NO hay token, redirige al usuario a la página de login.
  // El 'replace' evita que el usuario pueda volver a la página anterior con el botón "atrás" del navegador.
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // 3. Si SÍ hay un token, muestra el contenido protegido que se le pasó como 'children'.
  return children;
};

export default ProtectedRoute;