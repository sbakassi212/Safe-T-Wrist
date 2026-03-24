// Dans ton fichier login.jsx
import { authService } from '../services/api';

const handleLogin = async (e) => {
    e.preventDefault();
    try {
        // Appel au backend fourni
        const response = await authService.login({ email, password });
        
        // On récupère le Token et les infos utilisateur
        const { token, user } = response.data;

        // STOCKAGE SÉCURISÉ (RGPD / Cybersécurité) [cite: 21, 57]
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        console.log("Connecté ! Bracelet ID :", user.id_bracelet);
        navigate('/dashboard');
    } catch (error) {
        // Gestion des erreurs (401: Incorrect, etc.)
        alert(error.response?.data?.error || "Erreur de connexion au serveur");
    }
};