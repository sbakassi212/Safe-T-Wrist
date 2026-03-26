import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import de tes pages
// Note : Vérifie bien que les noms de fichiers correspondent (minuscules/majuscules)
import Login from './login';
import Register from './register';
import Dashboard from './dashboard'; 
import Historique from './historique'; // À créer si pas encore fait
import Contact from './contact';       // À créer si pas encore fait

import './App.css';

/**
 * LE VIGILE (ProtectedRoute)
 * Empêche l'accès aux pages si l'utilisateur n'est pas connecté.
 */
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        // Si pas de jeton dans le navigateur, on renvoie vers le login
        console.log("🚫 Accès refusé : Redirection vers Login");
        return <Navigate to="/login" replace />;
    }

    // Si le jeton existe, on affiche la page demandée
    return children;
};

function App() {
  return (
    <div className="app-main-container">
      <Routes>
        {/* --- ROUTES PUBLIQUES --- */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* --- ROUTES PROTÉGÉES (Nécessitent une connexion) --- */}
        {/* Le Dashboard */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        /> 

        {/* L'Historique */}
        <Route 
          path="/historique" 
          element={
            <ProtectedRoute>
              <Historique />
            </ProtectedRoute>
          } 
        /> 

        {/* Les Contacts d'urgence */}
        <Route 
          path="/contact" 
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          } 
        /> 
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  ); 
} 

export default App;