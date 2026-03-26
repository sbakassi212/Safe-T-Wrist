import React, { useState, useEffect } from 'react';
// 1. On corrige le chemin : tout est dans le même dossier 'src'
import Sidebar from './Sidebar'; 
import api from './api'; 
import './historique.css';

const Historique = () => {
    const [events, setEvents] = useState([]);
    const [filter, setFilter] = useState('TOUT'); 
    const user = JSON.parse(localStorage.getItem('user')) || {};

    // Récupération de l'historique depuis le backend
    const fetchHistory = async () => {
        if (!user.id_bracelet) return;
        try {
            const response = await api.get(`/alerts/history/${user.id_bracelet}`);
            setEvents(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération de l'historique", error);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, [user.id_bracelet]);

    // Filtrage des événements
    const filteredEvents = filter === 'TOUT' 
        ? events 
        : events.filter(e => e.type_alerte === filter);

    return (
        <div className="dashboard-layout">
            <Sidebar />
            
            <main className="history-content">
                <header className="history-header">
                    <h1>Historique des Alertes</h1>
                </header>

                <div className="filter-bar">
                    <button onClick={() => setFilter('TOUT')} className={filter === 'TOUT' ? 'active' : ''}>Tout</button>
                    <button onClick={() => setFilter('CHUTE')} className={filter === 'CHUTE' ? 'active' : ''}>Chutes</button>
                    <button onClick={() => setFilter('CARDIAQUE')} className={filter === 'CARDIAQUE' ? 'active' : ''}>Rythme Cardiaque</button>
                </div>

                <div className="table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Date et Heure</th>
                                <th>Type d'événement</th>
                                <th>Statut</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.map((event, index) => (
                                <tr key={index} className={event.type_alerte === 'CHUTE' ? 'row-critical' : ''}>
                                    <td>{new Date(event.date_heure).toLocaleString()}</td>
                                    <td>
                                        <span className={`badge ${event.type_alerte}`}>
                                            {event.type_alerte}
                                        </span>
                                    </td>
                                    <td>{event.statut === 0 ? "⚠️ Non traité" : "✅ Validé"}</td>
                                    <td><button className="btn-view">Détails</button></td>
                                </tr>
                            ))}
                            {filteredEvents.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                                        Aucun historique disponible.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default Historique;