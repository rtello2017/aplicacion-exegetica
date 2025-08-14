import { settings } from '../appSettings';
import { SessionExpiredError } from './errors';

export const apiFetch = async (endpoint, options = {}) => {
  // ✅ 1. Obtener el idioma actual directamente de localStorage.
  const currentLanguage = localStorage.getItem('appLanguage') || 'es';
  // ✅ 2. Obtener el paquete de textos localizado.
  const localized = settings.getLocalized(currentLanguage);

  const token = localStorage.getItem('token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${settings.urls.apiBase}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    // ✅ 3. Usar el texto localizado para el error.
    throw new SessionExpiredError(localized.ui.app.sessionExpired);
  }
  
  if (!response.ok) {
    // ✅ 4. Usar el texto localizado para el error.
    throw new Error(localized.ui.app.apiError);
  }
  
  if (response.headers.get("content-length") === "0") {
      return null;
  }

  return response.json();
};