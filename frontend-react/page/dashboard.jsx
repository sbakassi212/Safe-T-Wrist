import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import api from '../services/api'; // On utilise l'instance axios créée précédemment
import './dashboard.css';

const Dashboard = () => {
    // États pour les données dynamiques du bracelet
    const [measure, setMeasure] = useState({ bpm: '--', batterie: '--' });
    const [latestAlert, setLatestAlert] = useState(null);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});

    // Fonction pour récupérer les dernières mesures depuis le backend
    const fetchLatestData = async () => {
        try {
            // On imagine une route GET que ton collègue va créer pour lire la BDD
            const response = await api.get(`/measures/latest/${user.id_bracelet}`);
            if (response.data) {
                setMeasure(response.data);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des mesures", error);
        }
    };

    // Rafraîchissement automatique toutes les 5 secondes (Temps réel)
    useEffect(() => {
        const interval = setInterval(fetchLatestData, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            
            <main className="dashboard-content">
                <header className="dashboard-header">
                    <h1>Tableau de bord</h1>
                    <p>Bienvenue, {user.nom}. Surveillance active pour le bracelet #{user.id_bracelet}</p>
                </header>

                <div className="stats-grid">
                    {/* Carte Fréquence Cardiaque */}
                    <div className="stat-card heart-rate">
                        <div className="icon">❤️</div>
                        <div className="info">
                            <h3>Fréquence Cardiaque</h3>
                            <p className="value">{measure.bpm} <span>BPM</span></p>
                        </div>
                    </div>

                    {/* Carte État Batterie */}
                    <div className="stat-card battery">
                        <div className="icon">🔋</div>
                        <div className="info">
                            <h3>Batterie Bracelet</h3>
                            <p className="value">{measure.batterie}%</p>
                        </div>
                    </div>
                </div>

                {/* Section Alerte de Chute - Très important pour la sécurité */}
                <section className={`alert-section ${latestAlert ? 'active' : ''}`}>
                    <h3>Statut de sécurité</h3>
                    {latestAlert ? (
                        <div className="alert-box critical">
                            <strong>⚠️ CHUTE DÉTECTÉE !</strong>
                            <p>Une alerte a été envoyée aux contacts d'urgence.</p>
                        </div>
                    ) : (
                        <div className="alert-box normal">
                            ✅ Aucune anomalie détectée.
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Dashboard;