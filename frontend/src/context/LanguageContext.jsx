import React, { createContext, useState, useEffect, useContext } from 'react';
import { settings } from '../appSettings';

// 1. Creamos el contexto
const LanguageContext = createContext();

// 2. Creamos un "Hook" personalizado para usar el contexto fácilmente
export const useLanguage = () => useContext(LanguageContext);

// 3. Creamos el componente "Proveedor" que envolverá nuestra aplicación
export const LanguageProvider = ({ children }) => {
  const getInitialLanguage = () => localStorage.getItem('appLanguage') || 'es';
  const [language, setLanguage] = useState(getInitialLanguage());

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
  }, [language]);

  // Obtenemos los textos y datos localizados
  const localized = settings.getLocalized(language);

  // El valor que proveeremos a todos los componentes hijos
  const value = {
    language,
    setLanguage,
    localized,
    urls: settings.urls // Incluimos URLs globales
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};