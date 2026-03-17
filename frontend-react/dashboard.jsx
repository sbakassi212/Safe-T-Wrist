import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Dashboard.css';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [measures, setMeasures] = useState({ bpm: '--', batterie: '--' });
  const navigate = useNavigate();

  // REMPLACE PAR L'IP DE TA VM
  const API_URL = "http://172.29.18.254:3000";

  useEffect(() => {
    // 1. Récupération de l'utilisateur
    const savedUser = localStorage.getItem('user');
    if (!savedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(savedUser));
    }

    // 2. Récupération des données du bracelet
    const fetchMeasures = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData && userData.id_bracelet) {
          const response = await fetch(`${API_URL}/api/measures/last/${userData.id_bracelet}`);
          const data = await response.json();
          if (response.ok) {
            setMeasures(data);
          }
        }
      } catch (error) {
        console.error("Erreur récup mesures:", error);
      }
    };

    fetchMeasures();
    const interval = setInterval(fetchMeasures, 5000); // Update toutes les 5s

    return () => clearInterval(interval);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="dashboard-page">
      {/* --- BARRE LATÉRALE (SIDEBAR) --- */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span className="logo-icon">⌚</span>
          <span className="logo-text">Safe-T-Wrist</span>
        </div>
        <nav className="sidebar-nav">
          <a href="#" className="nav-item active">
            <span className="nav-icon">📊</span> Tableau de bord
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">❤️</span> Santé
          </a>
          <a href="#" className="nav-item">
            <span className="nav-icon">📅</span> Historique
          </a>
        </nav>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="nav-item logout" style={{background:'none', border:'none', width:'100%', cursor:'pointer', textAlign:'left'}}>
            <span className="nav-icon">🚪</span> Déconnexion
          </button>
        </div>
      </aside>

      {/* --- CONTENU PRINCIPAL --- */}
      <main className="main-content">
        <header className="top-bar">
          <h1>Bienvenue, {user.nom}</h1>
          <div className="user-info">
            <span className="user-name">{user.role}</span>
            <div className="user-avatar">{user.nom ? user.nom[0] : 'U'}</div>
          </div>
        </header>

        <div className="dashboard-container">
          {/* BANNIÈRE DE STATUT */}
          <div className="status-banner">
            <div className="status-icon">✅</div>
            <div className="status-info">
              <h3>Bracelet Connecté</h3>
              <p>ID : {user.id_bracelet || "Non lié"}</p>
            </div>
            <div className="battery-status">🔋 {measures.batterie}%</div>
          </div>

          {/* GRILLE DES STATISTIQUES */}
          <div className="stats-grid">
            <div className="stat-card heart-rate">
              <div className="stat-header">
                <span className="stat-icon">💓</span>
                <h3>Rythme Cardiaque</h3>
              </div>
              <div className="stat-value">
                {measures.bpm} <span className="unit">BPM</span>
              </div>
              <span className="stat-status normal">Normal</span>
            </div>

            <div className="stat-card alerts">
              <div className="stat-header">
                <span className="stat-icon">⚠️</span>
                <h3>Dernière Alerte</h3>
              </div>
              <div className="stat-value">Aucune</div>
              <span className="stat-status success">Sécurisé</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;