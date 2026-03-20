import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || { nom: "Utilisateur" };

    // Fonction de déconnexion (Sécurité & RGPD)
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="navbar-sidebar">
            <div className="navbar-logo">
                <img src="/src/assets/logo.svg" alt="Logo" />
                <span>Safe-t-wrist</span>
            </div>

            <div className="navbar-links">
                {/* NavLink ajoute automatiquement une classe "active" quand on est sur la page */}
                <NavLink title="Tableau de bord" to="/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="icon">📊</span> Tableau de bord
                </NavLink>

                <NavLink title="Historique" to="/historique" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                    <span className="icon">📜</span> Historique
                </NavLink>

                <NavLink title="Contacts d'urgence" to="/contact" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
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