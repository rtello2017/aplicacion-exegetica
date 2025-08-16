// frontend/src/context/AuthContext.jsx

import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export function AuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Al cargar la app, revisa si hay un token en localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      // Si hay token, consideramos al usuario logueado
      setUser({ token: storedToken });
    }
  }, []);

  const login = (userData) => {
    localStorage.setItem('token', userData.token);
    setUser(userData);
    navigate('/'); // Redirige a la ruta raíz después del login
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login'); // Redirige al login después de cerrar sesión
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}