import React, { createContext, useState, useEffect, useContext } from 'react';
import { settings } from '../appSettings';

// 1. Creamos el contexto
const LanguageContext = createContext();

// 2. Creamos un "Hook" personalizado para usar el contexto fácilmente
export const useLanguage = () => useContext(LanguageContext);

// 3. Creamos el componente "Proveedor" que envolverá nuestra aplicación
export const LanguageProvider = ({ children }) => {
  // --- ESTADOS DE IDIOMA ---
  const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'es');
  
  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  // --- ESTADOS DE AUTENTICACIÓN ---
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // ✅ CORRECCIÓN: Faltaba este useEffect para verificar el token al cargar la app
  useEffect(() => {
    const verifyToken = async () => {
      // Si tenemos un token en el estado, intentamos verificarlo
      if (token) {
        try {
          const response = await fetch(`${settings.urls.apiBase}/auth/verify-token`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user); // El token es válido, guardamos los datos del usuario
          } else {
            // Si el token es inválido (expirado, etc.), lo limpiamos
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          // Si hay un error de red, también limpiamos el token
          console.error("Error de red al verificar el token", error);
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      // Marcamos la verificación como completada
      setIsAuthLoading(false);
    };

    verifyToken();
  }, [token]); // Este efecto se ejecuta cada vez que el token cambia

  // Obtenemos los textos y datos localizados
  const localized = settings.getLocalized(language);

  // ✅ CORRECCIÓN: Faltaba la función de logout
  const logout = () => {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
  };

  // ✅ CORRECCIÓN: Faltaban los valores de autenticación en el objeto 'value'
  const value = {
    language,
    setLanguage,
    localized,
    urls: settings.urls,
    token,
    setToken, // Lo exponemos para que LoginPage pueda actualizarlo
    user,
    logout,
    isAuthLoading
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};