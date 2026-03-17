import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  // 1. Déclaration des variables d'état (State)
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', color: '' });
  const navigate = useNavigate();

  // Ton IP de VM
  const API_URL = "http://172.29.18.254:3000"; 

  const handleRegister = async (e) => {
    e.preventDefault();

    // 2. Vérification des mots de passe (comme dans ton ancien JS)
    if (formData.password !== formData.confirmPassword) {
      setMessage({ text: "Les mots de passe ne correspondent pas !", color: "red" });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nom: `${formData.nom} ${formData.prenom}`, // On regroupe pour ton backend
          email: formData.email,
          password: formData.password,
          role: 'PROCHE' // Valeur par défaut
        })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: "Inscription réussie ! Redirection...", color: "#28a745" });
        
        // Redirection après 2 secondes (comme dans ton setTimeout)
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setMessage({ text: data.error || "Erreur lors de l'inscription", color: "red" });
      }
    } catch (error) {
      setMessage({ text: "Le serveur ne répond pas.", color: "red" });
    }
  };

  // Fonction pratique pour mettre à jour le state
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  return (
    <div className="login-container"> {/* Utilise tes classes CSS existantes */}
      <h2>Inscription Safe-T-Wrist</h2>
      
      <form onSubmit={handleRegister}>
        <label htmlFor="nom">Nom</label>
        <input type="text" id="nom" placeholder="Votre nom" required onChange={handleChange} />

        <label htmlFor="prenom">Prénom</label>
        <input type="text" id="prenom" placeholder="Votre prénom" required onChange={handleChange} />

        <label htmlFor="email">Email</label>
        <input type="email" id="email" placeholder="Safe-T-wrist@gmail.com" required onChange={handleChange} />

        <label htmlFor="password">Mot de passe</label>
        <input type="password" id="password" placeholder="********" required onChange={handleChange} />

        <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
        <input type="password" id="confirmPassword" placeholder="********" required onChange={handleChange} />

        {/* Affichage du message avec la couleur dynamique */}
        {message.text && (
          <p style={{ color: message.color, fontWeight: 'bold' }}>{message.text}</p>
        )}

        <button type="submit" className="btn-connexion">S'inscrire</button>
      </form>

      <p className="register-link">
        Déjà inscrit ? <Link to="/login">Connecte-toi</Link>
      </p>
    </div>
  );
}

export default Register;