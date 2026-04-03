import axios from 'axios';

// L'adresse de ton serveur Node.js
const API_URL = 'http://172.29.18.99:3000/api';

// 1. Création de l'instance Axios
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// 2. Ajout de l'intercepteur de REQUÊTE
// Ce code s'exécute AUTOMATIQUEMENT avant chaque appel API (GET, POST, PUT, DELETE)
api.interceptors.request.use(
    (config) => {
        // On récupère le token que tu as sauvegardé dans login.jsx
        const token = localStorage.getItem('token');
        
        // Si le token existe, on l'ajoute dans le header "Authorization"
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// 3. Ajout d'un intercepteur de RÉPONSE (Optionnel mais recommandé)
// Si le serveur répond 401 (Token expiré ou invalide), on déconnecte l'utilisateur
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn("Session expirée ou non autorisée. Déconnexion...");
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Optionnel : rediriger vers /login
            // window.location.href = '/login'; 
        }
        return Promise.reject(error);
    }
);

// 4.  services d'authentification
export const authService = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    linkBracelet: (data) => api.put('/auth/link-bracelet', data)
};

export default api;