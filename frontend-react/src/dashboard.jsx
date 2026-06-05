import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar'; 
import api from './api';           
import './dashboard.css';

const Dashboard = () => {
    const [measure, setMeasure] = useState({ bpm: '--', batterie: '--', derniere_alerte: null });
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [braceletInput, setBraceletInput] = useState('');

    // --- LIER LE BRACELET ---
    const handleLinkBracelet = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/auth/link-bracelet', {
                email: user.email,
                id_bracelet: braceletInput
            });
            alert(response.data.message);
            const updatedUser = { 
                ...user, 
                id_bracelet: braceletInput, 
                role: response.data.message.includes('Administrateur') ? 'ADMIN' : 'PROCHE' 
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            window.location.reload(); 
        } catch (error) {
            alert("Erreur : " + (error.response?.data?.error || "Serveur injoignable"));
        }
    };

    // --- RÉCUPÉRER LES DONNÉES ---
    const fetchLatestData = async () => {
        if (!user.id_bracelet) return;
        try {
            const response = await api.get(`/last-measure/${user.id_bracelet}`);
            if (response.data) setMeasure(response.data);
        } catch (error) {
            console.error("Erreur mesures", error);
        }
    };

    useEffect(() => {
        fetchLatestData();
        const interval = setInterval(fetchLatestData, 5000);
        return () => clearInterval(interval);
    }, [user.id_bracelet]);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            
            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h1>Tableau de bord</h1>
                    <p>Bienvenue, <strong>{user.nom}</strong>. Surveillance en temps réel.</p>
                </header>

                {!user.id_bracelet ? (
                    <section className="link-section">
                        <div className="link-card">
                            <h3>🔗 Lier un bracelet</h3>
                            <p>Entrez l'ID de votre appareil Safe-T-Wrist pour commencer.</p>
                            <form onSubmit={handleLinkBracelet}>
                                <input 
                                    type="text" 
                                    value={braceletInput}
                                    onChange={(e) => setBraceletInput(e.target.value)}
                                    required 
                                />
                                <button type="submit">Activer le bracelet</button>
                            </form>
                        </div>
                    </section>
                ) : (
                    <div className="dashboard-grid">
                        <div className="stats-grid">
                            {/* BPM CARD */}
                            <div className={`stat-card heart-rate ${measure.bpm > 100 ? 'critical' : ''}`}>
                                <div className="icon">❤️</div>
                                <div className="info">
                                    <h3>Fréquence Cardiaque</h3>
                                    <p className="value">{measure.bpm} <span>BPM</span> <span className="dot"></span></p>
                                </div>
                            </div>

                            {/* BATTERY CARD */}
                            <div className="stat-card battery">
                                <div className="icon">{measure.batterie < 20 ? '🪫' : '🔋'}</div>
                                <div className="info">
                                    <h3>Batterie</h3>
                                    <p className={`value ${measure.batterie < 20 ? 'low' : ''}`}>{measure.batterie}%</p>
                                </div>
                            </div>    
                        </div>

                        {/* STATUS AUTOMATIQUE */}
                        <div className="automation-banner">
                            <div className="status-label">
                                <span className="status-icon">🛡️</span>
                                <div>
                                    <h4>Protection Active</h4>
                                    <p>En cas de chute, un message WhatsApp est envoyé automatiquement aux proches.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;