import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Connexion.css';

function Connexion() {
  // Déclaration des états (States) pour capturer la saisie
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // REMPLACE PAR L'IP DE TA VM ET LE PORT DU BACKEND (3000)
  const API_URL = "http://172.29.18.254:3000/api/auth/login";

  const handleLogin = async (e) => {
    e.preventDefault(); // Empêche le rechargement de la page
    setMessage(''); // Réinitialise le message d'erreur

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // SUCCÈS : On enregistre le token et l'utilisateur dans le navigateur
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // On redirige vers le Dashboard
        navigate('/dashboard');
      } else {
        // ERREUR : On affiche le message d'erreur du backend
        setMessage(data.error || "Email ou mot de passe incorrect");
      }
    } catch (error) {
      setMessage("Erreur : le serveur ne répond pas");
    }
  };

  return (
    <div className="page-background">
      <div className="login-container">
        <h2>Connexion</h2>
        
        <form onSubmit={handleLogin}>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Safe-t-wrist@gmail.com"
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

          {/* Affichage dynamique du message d'erreur */}
          {message && <p id="message" style={{ color: '#ffda79', textAlign: 'center' }}>{message}</p>}

          <button type="submit" className="btn-connexion">
            Entrer
          </button>
        </form>

        <p className="register-link">
          Pas encore inscrit ? <Link to="/register">Crée ton compte</Link>
        </p>
      </div>
    </div>
  );
}

export default Connexion;