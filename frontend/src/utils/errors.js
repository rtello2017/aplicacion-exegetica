// Este error nos permitirá identificar cuándo una sesión ha expirado, sin importar el idioma.
export class SessionExpiredError extends Error {
  constructor(message = 'La sesión ha expirado.') {
    super(message);
    this.name = 'SessionExpiredError';
  }
}