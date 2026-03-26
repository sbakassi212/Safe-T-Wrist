import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar'; 
import api from './api'; 
import './contact.css';

const Contact = () => {
    const [contacts, setContacts] = useState([]);
    const [user] = useState(JSON.parse(localStorage.getItem('user')) || {});
    
    // État pour le formulaire (sert à l'ajout ET à la modification)
    const [formContact, setFormContact] = useState({ nom: '', email: '', telephone: '' });
    
    // État pour savoir si on est en train de modifier un contact
    const [editingId, setEditingId] = useState(null);

    // --- 1. CHARGER LES CONTACTS ---
    const fetchContacts = async () => {
        if (!user.id) return;
        try {
            const response = await api.get(`/contacts/${user.id}`);
            setContacts(response.data);
        } catch (error) {
            console.error("Erreur de récupération :", error);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [user.id]);

    const handleChange = (e) => {
        setFormContact({ ...formContact, [e.target.id]: e.target.value });
    };

    // --- 2. LOGIQUE DE VALIDATION ---
    const validateData = (data, isUpdating = false) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const telRegex = /^\+33[1-9][0-9]{8}$/;

        if (!emailRegex.test(data.email)) {
            alert("L'adresse e-mail n'est pas valide.");
            return false;
        }
        if (!telRegex.test(data.telephone)) {
            alert("Le téléphone doit être au format +33612345678.");
            return false;
        }

        // Vérification des doublons (on ignore le contact lui-même si on est en train de le modifier)
        const doublonEmail = contacts.find(c => c.email.toLowerCase() === data.email.toLowerCase() && c.id !== editingId);
        const doublonTel = contacts.find(c => c.tel === data.telephone && c.id !== editingId);

        if (doublonEmail) {
            alert("Cet email est déjà utilisé par un autre contact.");
            return false;
        }
        if (doublonTel) {
            alert("Ce numéro est déjà utilisé par un autre contact.");
            return false;
        }
        return true;
    };

    // --- 3. ENREGISTRER (AJOUT OU MODIFICATION) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateData(formContact)) return;

        try {
            if (editingId) {
                // MODE MODIFICATION (PUT)
                await api.put(`/contacts/${editingId}`, {
                    nom: formContact.nom,
                    tel: formContact.telephone,
                    email: formContact.email,
                    id_user: user.id
                });
                alert("✅ Contact mis à jour !");
            } else {
                // MODE AJOUT (POST)
                await api.post('/contacts', {
                    nom: formContact.nom,
                    tel: formContact.telephone,
                    email: formContact.email,
                    id_user: user.id 
                });
                alert("✅ Contact ajouté !");
            }

            setFormContact({ nom: '', email: '', telephone: '' });
            setEditingId(null);
            fetchContacts(); 
        } catch (error) {
            alert("❌ Erreur lors de l'opération.");
        }
    };

    // --- 4. PRÉPARER LA MODIFICATION ---
    const startEdit = (contact) => {
        setEditingId(contact.id);
        setFormContact({
            nom: contact.nom,
            email: contact.email,
            telephone: contact.tel
        });
        // On remonte en haut de page pour voir le formulaire
        window.scrollTo(0, 0);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setFormContact({ nom: '', email: '', telephone: '' });
    };

    // --- 5. SUPPRIMER UN CONTACT ---
    const handleDelete = async (id_contact) => {
        if (!window.confirm("Supprimer ce contact ?")) return;
        try {
            await api.delete(`/contacts/${id_contact}`, {
                data: { id_user: user.id }
            });
            fetchContacts();
        } catch (error) {
            console.error("Erreur suppression :", error);
        }
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            
            <main className="contact-content">
                <header className="contact-header">
                    <h1>👥 Contacts d'Urgence</h1>
                    <p>Gérez les proches alertés pour le bracelet <strong>#{user.id_bracelet}</strong></p>
                </header>

                <section className="contact-form-section">
                    <form onSubmit={handleSubmit} className="contact-form">
                        <h3>{editingId ? "📝 Modifier le proche" : "➕ Ajouter un nouveau proche"}</h3>
                        <div className="input-row">
                            <input type="text" id="nom" placeholder="Nom / Pseudo" value={formContact.nom} onChange={handleChange} required />
                            <input type="email" id="email" placeholder="Email" value={formContact.email} onChange={handleChange} required />
                            <input type="tel" id="telephone" placeholder="+33612345678" value={formContact.telephone} onChange={handleChange} required />
                            
                            <button type="submit" className={editingId ? "btn-update" : "btn-add"}>
                                {editingId ? "Enregistrer les modifications" : "Enregistrer"}
                            </button>

                            {editingId && (
                                <button type="button" className="btn-cancel" onClick={cancelEdit}>
                                    Annuler
                                </button>
                            )}
                        </div>
                    </form>
                </section>

                <section className="contact-list">
                    <h3>Liste de vos contacts</h3>
                    <table className="styled-table">
                        <thead>
                            <tr>
                                <th>Nom / Pseudo</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.length > 0 ? (
                                contacts.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.nom}</td>
                                        <td>{c.email}</td>
                                        <td style={{fontWeight: 'bold'}}>{c.tel}</td> 
                                        <td>
                                            <button onClick={() => startEdit(c)} className="btn-edit">
                                                Modifier
                                            </button>
                                            <button onClick={() => handleDelete(c.id)} className="btn-delete">
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="4" className="empty-msg">Aucun contact trouvé.</td></tr>
                            )}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
};

export default Contact;