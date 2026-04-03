import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css'; 

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.clear(); 
        navigate('/login');
    };

    return (
        <div className="sidebar">
            <div className="sidebar-brand">
                <h2>Safe-T-Wrist</h2>
                <span className="status-online">● Système Actif</span>
            </div>

            <nav className="sidebar-menu">
                <Link to="/dashboard" className={`menu-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                    <span className="icon">🏠</span> Dashboard
                </Link>
                
                <Link to="/historique" className={`menu-item ${location.pathname === '/historique' ? 'active' : ''}`}>
                    <span className="icon">📊</span> Historique
                </Link>

                <Link to="/contact" className={`menu-item ${location.pathname === '/contact' ? 'active' : ''}`}>
                    <span className="icon">📞</span> Contacts
                </Link>

                {/* --- DÉPLACÉ ICI : Juste en dessous de Contacts --- */}
                <Link to="/mentions-legales" className={`menu-item ${location.pathname === '/mentions-legales' ? 'active' : ''}`}>
                    <span className="icon">⚖️</span> Mentions Légales
                </Link>
            </nav>

            <div className="sidebar-footer">
                <button onClick={handleLogout} className="logout-btn">
                    Se déconnecter
                </button>
            </div>
        </div>
    );
};

export default Sidebar;