import axios from 'axios';

// On remplace localhost par l'IP réelle du serveur de test
const API_URL = 'http://172.29.18.254:3000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const authService = {
    register: (userData) => api.post('/auth/register', userData),
    login: (credentials) => api.post('/auth/login', credentials),
    linkBracelet: (data) => api.put('/auth/link-bracelet', data)
};

export default api;