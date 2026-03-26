import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from './api'; // Ton instance Axios
import './login.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            // Appel au backend
            const response = await api.post('/auth/login', { email, password });
            
            // On récupère le token et les infos de base renvoyées par le back
            const { token, user } = response.data;

            if (token) {
                // STOCKAGE DU TOKEN
                localStorage.setItem('token', token);

                // COMPLÉTER LES INFOS DE L'UTILISATEUR
                const completeUser = { 
                    ...user, 
                    email: email // On utilise la variable 'email' de l'input
                };

                // ENREGISTREMENT DÉFINITIF
                localStorage.setItem('user', JSON.stringify(completeUser));

                console.log("Connexion réussie ! Utilisateur complet :", completeUser);
                
                //  REDIRECTION
                navigate('/dashboard');
            }
        } catch (err) {
            console.error("Erreur de connexion :", err);
            setError(err.response?.data?.error || "Identifiants incorrects ou serveur éteint.");
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Connexion Safe-T-Wrist</h2>
                <p>Accédez à votre interface de surveillance</p>

                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            placeholder="votre@email.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label>Mot de passe</label>
                        <input 
                            type="password" 
                            placeholder="••••••••" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>

                    <button type="submit" className="login-btn">
                        Se connecter
                    </button>
                </form>

                <div className="login-footer">
                    Pas encore de compte ? <Link to="/register">S'inscrire</Link>
                </div>
            </div>
        </div>
    );
};

export default Login;