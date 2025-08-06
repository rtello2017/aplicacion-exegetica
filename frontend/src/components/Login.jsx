import React, { useState } from 'react';
import './Login.css'; // Estilos para este componente

function Login({ setAuthToken }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!username || !password) {
        setError('Por favor, complete todos los campos.');
        return;
    }

    const endpoint = isRegistering ? '/api/auth/register' : '/api/auth/login';

    try {
      const response = await fetch(`http://localhost:4000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Ocurrió un error.');
      }

      if (isRegistering) {
        setMessage('¡Registro exitoso! Ahora puedes iniciar sesión.');
        setIsRegistering(false); // Vuelve al modo de login
        setUsername('');
        setPassword('');
      } else {
        // Si el login es exitoso, guarda el token y actualiza el estado en App.jsx
        localStorage.setItem('token', data.token);
        setAuthToken(data.token);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        {/* --- TÍTULO AÑADIDO --- */}
        <h1 className="login-title">Proyecto Exegética Bíblica</h1>
        <h2>{isRegistering ? 'Crear Cuenta' : 'Acceso al Sistema'}</h2>
        <div className="input-group">
          <label htmlFor="username">Usuario</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {message && <p className="success-message">{message}</p>}
        <div className="button-group">
          <button type="submit">{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</button>
        </div>
        <div className="toggle-form">
          {isRegistering ? (
            <p>¿Ya tienes una cuenta? <span onClick={() => setIsRegistering(false)}>Inicia sesión</span></p>
          ) : (
            <p>¿No tienes una cuenta? <span onClick={() => setIsRegistering(true)}>Regístrate</span></p>
          )}
        </div>
      </form>
    </div>
  );
}

export default Login;
