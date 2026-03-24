import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api'; // Import du service pour communiquer avec Node.js
import './register.css';

const Register = () => {
    // États pour le formulaire (basés sur les besoins du backend)
    const [formData, setFormData] = useState({
        nom: '',
        email: '',
        password: '',
        role: 'PROCHE' // Rôle par défaut selon ton backend
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Mise à jour dynamique des champs
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Appel à la route app.post('/api/auth/register') de ton backend
            await authService.register(formData);
            
            alert("Compte créé avec succès ! Vous pouvez vous connecter.");
            navigate('/login'); // Redirection vers la connexion
        } catch (err) {
            // Gestion de l'erreur 409 (Email déjà utilisé) ou 500
            setError(err.response?.data?.error || "Erreur lors de l'inscription");
        }
    };

    return (
        <div className="register-container">
            <form className="register-form" onSubmit={handleRegister}>
                <h2>Créer un compte</h2>
                <p>Rejoignez la plateforme Safe-t-wrist</p>

                {error && <p className="error-message">{error}</p>}

                <div className="input-group">
                    <label htmlFor="nom">Nom complet</label>
                    <input type="text" id="nom" onChange={handleChange} required />
                </div>

                <div className="input-group">
                    <label htmlFor="email">Adresse E-mail</label>
                    <input type="email" id="email" onChange={handleChange} required />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Mot de passe</label>
                    <input type="password" id="password" onChange={handleChange} required />
                </div>

                <button type="submit" className="register-button">S'inscrire</button>

                <p className="login-link">
                    Déjà inscrit ? <Link to="/login">Se connecter</Link>
                </p>
            </form>
        </div>
    );
};

export default Register;