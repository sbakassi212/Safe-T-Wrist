import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar'; 
import api from './api'; 
import './historique.css';

const Historique = () => {
    const [events, setEvents] = useState([]);
    const [contacts, setContacts] = useState([]); 
    const [filter, setFilter] = useState('TOUT'); 
    const [timeFilter, setTimeFilter] = useState('ALL'); 
    const [selectedEvent, setSelectedEvent] = useState(null); 
    
    const user = JSON.parse(localStorage.getItem('user')) || { 
        nom: "Utilisateur Démo", 
        id_bracelet: "BRACELET_01" 
    };

    const fetchHistory = async () => {
        if (!user.id_bracelet) return;
        try {
            const response = await api.get(`/history/${user.id_bracelet}`);
            setEvents(response.data || []);
        } catch (error) { console.error("Erreur historique", error); }
    };

    const fetchContacts = async () => {
        if (!user.id_bracelet) return;
        try {
            const response = await api.get(`/contacts/${user.id_bracelet}`);
            setContacts(response.data || []);
        } catch (error) { console.error("Erreur contacts", error); }
    };

    useEffect(() => {
        fetchHistory();
        fetchContacts();
        const interval = setInterval(fetchHistory, 5000); // Check toutes les 5s pour Postman
        return () => clearInterval(interval);
    }, [user.id_bracelet]);

    // --- LOGIQUE DE FILTRAGE ---
    const filteredEvents = events.filter(e => {
        const matchType = filter === 'TOUT' || e.type_alerte === filter;
        
        const eventDate = new Date(e.date_heure);
        const now = new Date();
        const diffDays = (now - eventDate) / (1000 * 60 * 60 * 24);
        
        let matchTime = true;
        if (timeFilter === 'TODAY') matchTime = diffDays < 1;
        else if (timeFilter === 'WEEK') matchTime = diffDays < 7;
        else if (timeFilter === 'MONTH') matchTime = diffDays < 30;

        return matchType && matchTime;
    });

    return (
        <div className="dashboard-layout">
            <Sidebar />
            
            <main className="history-content">
                <header className="history-header">
                    <h1>📜 Historique des Alertes</h1>
                </header>

                <div className="filters-container">
                    <div className="filter-group">
                        <label>Type :</label>
                        <div className="filter-bar">
                            <button onClick={() => setFilter('TOUT')} className={filter === 'TOUT' ? 'active' : ''}>Tout</button>
                            <button onClick={() => setFilter('CHUTE')} className={filter === 'CHUTE' ? 'active' : ''}>Chutes</button>
                            <button onClick={() => setFilter('CARDIAQUE')} className={filter === 'CARDIAQUE' ? 'active' : ''}>Cœur</button>
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Période :</label>
                        <select className="time-select" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)}>
                            <option value="ALL">Toutes les dates</option>
                            <option value="TODAY">Dernières 24h</option>
                            <option value="WEEK">7 derniers jours</option>
                            <option value="MONTH">30 derniers jours</option>
                        </select>
                    </div>
                </div>

                <div className="table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Date & Heure</th>
                                <th>Événement</th>
                                <th>Statut Système</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredEvents.length > 0 ? (
                                filteredEvents.map((event, index) => (
                                    <tr key={index} className={event.type_alerte === 'CHUTE' ? 'row-critical' : ''}>
                                        <td>{new Date(event.date_heure).toLocaleString('fr-FR')}</td>
                                        <td><span className={`badge ${event.type_alerte}`}>{event.type_alerte}</span></td>
                                        <td>
                                            {event.type_alerte === 'CHUTE' ? (
                                                <span className="status-auto-sent">🚀 Message Auto Envoyé</span>
                                            ) : (
                                                <span className="status-manual">🔔 En attente</span>
                                            )}
                                        </td>
                                        <td>
                                            {event.type_alerte === 'CHUTE' ? (
                                                <em className="text-muted">Sécurité activée</em>
                                            ) : (
                                                <button className="btn-open-msg" onClick={() => setSelectedEvent(event)}>📩 Prévenir</button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="empty-msg">Aucune alerte trouvée pour cette période.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {selectedEvent && (
                    <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
                        <div className="modal-content" onClick={e => e.stopPropagation()}>
                            <header className="modal-header">
                                <h3>Informer un proche</h3>
                                <button className="close-btn" onClick={() => setSelectedEvent(null)}>&times;</button>
                            </header>
                            <div className="modal-body">
                                <p>Alerte : <strong>{selectedEvent.type_alerte}</strong></p>
                                <div className="contact-list-mini">
                                    {contacts.map(c => (
                                        <a key={c.id} href={`https://wa.me/${c.tel.replace('+', '')}?text=Alerte Safe-T-Wrist : Problème détecté à ${new Date(selectedEvent.date_heure).toLocaleTimeString()}.`} target="_blank" rel="noopener noreferrer" className="contact-option">
                                            <span>👤 {c.nom}</span>
                                            <span className="wa-icon">WhatsApp ➔</span>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Historique;