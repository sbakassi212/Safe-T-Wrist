import React, { useState } from 'react';
import './Connexion.css';

function Connexion() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const login = (e) => {
    e.preventDefault();
    console.log("Connexion avec :", email);
  };

  return (
    <div className="page-background">
      <div className="login-container">
        <h2>Connexion</h2>
        <form onSubmit={login}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Safe-t-wrist@gmail.com" // L'email va ICI maintenant
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              placeholder="********" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          <p id="message">{message}</p>

          <button type="submit" className="btn-connexion">
            Entrer dans le stade
          </button>
        </form>
        <p className="register-link">
          Pas encore inscrit ? <a href="/inscription">Crée ton compte</a>
        </p>
      </div>
    </div>
  );
}

export default Connexion;