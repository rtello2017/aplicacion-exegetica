import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext'; // Asumiendo que quieres usarlo aquí también
import './LoginPage.css'; // Crea este archivo para los estilos

function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { localized, urls } = useLanguage();

  const auth = useContext(AuthContext);

  const t = localized.ui.loginPage;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const endpoint = isLoginView ? '/auth/login' : '/auth/register';
    
    try {
      const response = await fetch(`${urls.apiBase}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || t.genericError);
      }

      if (isLoginView) {
        localStorage.setItem('token', data.token); // Guardamos el token
        auth.login({ token: data.token, username: data.username });
      } else {
        // Si es registro, cambiamos a la vista de login para que inicie sesión
        setIsLoginView(true);
        alert(t.registerSuccess);
      }

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="login-container">
      <h1 className="main-app-title">{localized.ui.app.title}</h1>
      <div className="login-box">
        <h2>{isLoginView ? t.title : t.registerTitle}</h2>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label htmlFor="username">{t.usernameLabel}</label>
            <input type="text" id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="input-group">
            <label htmlFor="password">{t.passwordLabel}</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <p className="error-message">{error}</p>}
          <button type="submit" className="submit-btn">
            {isLoginView ? t.submitButton : t.registerButton}
          </button>
        </form>
        <p className="toggle-view">
          {isLoginView ? t.toggleToRegister : t.toggleToLogin}
          <button onClick={() => setIsLoginView(!isLoginView)}>
            {isLoginView ? t.registerLink : t.loginLink}
          </button>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;