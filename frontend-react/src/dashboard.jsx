import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar'; 
import api from './api';           
import './dashboard.css';

const Dashboard = () => {
    const [measure, setMeasure] = useState({ bpm: '--', batterie: '--' });
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
    const [braceletInput, setBraceletInput] = useState(''); // Pour le champ de texte

    // --- FONCTION POUR LIER LE BRACELET ---
    const handleLinkBracelet = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/auth/link-bracelet', {
                email: user.email,
                id_bracelet: braceletInput
            });

            alert(response.data.message);

            // IMPORTANT : On met à jour l'utilisateur dans le stockage local
            // car son rôle a peut-être changé (PROCHE -> ADMIN)
            const updatedUser = { ...user, id_bracelet: braceletInput, role: response.data.message.includes('Administrateur') ? 'ADMIN' : 'PROCHE' };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            
            window.location.reload(); // On rafraîchit pour mettre à jour la Sidebar et les accès
        } catch (error) {
            alert("Erreur lors de l'appairage : " + (error.response?.data?.error || "Serveur injoignable"));
        }
    };

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
                    <p>Bienvenue, {user.nom}.</p>
                </header>

                {/* SI PAS DE BRACELET : On affiche le formulaire d'appairage */}
                {!user.id_bracelet ? (
                    <section className="link-section">
                        <div className="link-card">
                            <h3>🔗 Lier un bracelet</h3>
                            <p>Entrez l'identifiant de votre appareil Safe-T-Wrist pour commencer la surveillance.</p>
                            <form onSubmit={handleLinkBracelet}>
                                <input 
                                    type="text" 
                                    placeholder="Ex: BRACELET_01" 
                                    value={braceletInput}
                                    onChange={(e) => setBraceletInput(e.target.value)}
                                    required 
                                />
                                <button type="submit">Activer le bracelet</button>
                            </form>
                        </div>
                    </section>
                ) : (
                    /* SI BRACELET LIÉ : On affiche les mesures habituelles */
                    <div className="stats-grid">
                        <div className="stat-card heart-rate">
                            <div className="icon">❤️</div>
                            <div className="info">
                                <h3>Fréquence Cardiaque</h3>
                                <p className="value">{measure.bpm} <span>BPM</span></p>
                            </div>
                        </div>
                        <div className="stat-card battery">
                            <div className="icon">🔋</div>
                            <div className="info">
                                <h3>Batterie</h3>
                                <p className="value">{measure.batterie}%</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;