import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Import des pages
import Login from './login';
import Register from './register';
import Dashboard from './dashboard'; 
import Historique from './historique'; 
import Contact from './contact'; 
import MentionsLegales from "./legal";

import './App.css';

/* Empêche l'accès aux pages si l'utilisateur n'est pas connecté. */
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.log("🚫 Accès refusé : Redirection vers Login");
        return <Navigate to="/login" replace />;
    }

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
        
        {/* --- ROUTES PROTÉGÉES --- */}
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
        /> 

        <Route 
          path="/historique" 
          element={<ProtectedRoute><Historique /></ProtectedRoute>} 
        /> 

        <Route 
          path="/contact" 
          element={<ProtectedRoute><Contact /></ProtectedRoute>} 
        /> 

        {/* 2. AJOUT DE LA ROUTE ICI */}
        <Route 
          path="/mentions-legales" 
          element={
            <ProtectedRoute>
              <MentionsLegales />
            </ProtectedRoute>
          } 
        /> 

        {/* Redirection par défaut pour les pages inconnues */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  ); 
} 

export default App;