import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar'; // On réutilise ta barre latérale
import './contact.css';

const Contact = () => {
    // État pour stocker la liste des contacts d'urgence
    const [contacts, setContacts] = useState([]);
    
    // État pour le formulaire d'ajout
    const [newContact, setNewContact] = useState({
        nom: '',
        email: '',
        telephone: '',
        priorite: '1'
    });

    // Simulation de récupération des données au chargement (Lien avec l'API de l'Étudiant 2)
    useEffect(() => {
        // Ici, tu feras un fetch vers ton backend Node.js
        console.log("Chargement des contacts d'urgence...");
    }, []);

    const handleChange = (e) => {
        setNewContact({ ...newContact, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Logique de cybersécurité : Validation des données avant envoi
        if(newContact.email.includes('@')) {
            setContacts([...contacts, newContact]);
            setNewContact({ nom: '', email: '', telephone: '', priorite: '1' });
            alert("Contact d'urgence enregistré !");
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar /> {/* Ta barre de navigation à gauche */}
            
            <main className="contact-content">
                <header>
                    <h1>Contacts d'urgence</h1>
                    <p>Configurez les personnes à prévenir en cas d'alerte Safe-t-wrist</p>
                </header>

                <section className="contact-form-section">
                    <form onSubmit={handleSubmit} className="contact-form">
                        <h3>Ajouter un nouveau proche</h3>
                        <div className="input-row">
                            <input type="text" id="nom" placeholder="Nom du proche" value={newContact.nom} onChange={handleChange} required />
                            <input type="email" id="email" placeholder="Email" value={newContact.email} onChange={handleChange} required />
                            <input type="tel" id="telephone" placeholder="Téléphone" value={newContact.telephone} onChange={handleChange} required />
                            <button type="submit" className="btn-add">Enregistrer</button>
                        </div>
                    </form>
                </section>

                <section className="contact-list">
                    <h3>Liste de vos contacts configurés</h3>
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((c, index) => (
                                <tr key={index}>
                                    <td>{c.nom}</td>
                                    <td>{c.email}</td>
                                    <td>{c.telephone}</td>
                                    <td><button className="btn-delete">Supprimer</button></td>
                                </tr>
                            ))}
                            {contacts.length === 0 && <tr><td colSpan="4">Aucun contact configuré pour le moment.</td></tr>}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
};

export default Contact;