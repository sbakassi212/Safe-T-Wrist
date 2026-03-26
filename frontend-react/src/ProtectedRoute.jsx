import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    // On regarde si un token existe dans la mémoire du navigateur
    const token = localStorage.getItem('token');
    
    // S'il n'y a pas de token, on redirige vers le login
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Si le token existe, on affiche la page demandée (le Dashboard)
    return children;
};

export default ProtectedRoute;