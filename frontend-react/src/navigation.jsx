import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
// CORRECTION : On utilise le bon nom de fichier présent dans ton dossier src
import './navigation.css';

const Navbar = () => {
    const navigate = useNavigate();
    
    // Récupération sécurisée de l'utilisateur
    const user = JSON.parse(localStorage.getItem('user')) || { nom: "Utilisateur", role: "PROCHE" };

    // Fonction de déconnexion
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="navbar-sidebar">
            <div className="navbar-logo">
                {/* ⚠️ Vérifie que le dossier assets existe bien dans src ! */}
                <img src="/src/assets/logo.svg" alt="Logo" />
                <span>Safe-t-wrist</span>
            </div>

            <div className="navbar-links">
                <NavLink 
                    to="/dashboard" 
                    className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                >
                    <span className="icon">📊</span> Tableau de bord
                </NavLink>

                <NavLink 
                    to="/historique" 
                    className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                >
                    <span className="icon">📜</span> Historique
                </NavLink>

                <NavLink 
                    to="/contact" 
                    className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                >
                    <span className="icon">📞</span> Contacts
                </NavLink>
            </div>

            <div className="navbar-footer">
                <div className="user-info">
                    <p className="user-name">{user.nom}</p>
                    <p className="user-role">{user.role}</p>
                </div>
                <button onClick={handleLogout} className="logout-button">
                    Déconnexion
                </button>
            </div>
        </nav>
    );
};

export default Navbar;