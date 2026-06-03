import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar'; 
import api from './api'; 
import './contact.css';

const Contact = () => {
    const [contacts, setContacts] = useState([]);
    const [user] = useState(() => {
        const saved = localStorage.getItem('user');
        return saved ? JSON.parse(saved) : { id: null, role: 'PROCHE', id_bracelet: '' };
    });
    
    const [form, setForm] = useState({ nom: '', email: '', telephone: '' });
    const [isEditing, setIsEditing] = useState(null);

    // --- 1. CHARGEMENT DES CONTACTS ---
    const fetchContacts = async () => {
        if (!user.id_bracelet) return;
        try {
            const response = await api.get(`/contacts/${user.id_bracelet}`);
            setContacts(response.data || []);
        } catch (error) {
            console.error("Erreur de chargement :", error);
            setContacts([]);
        }
    };

    useEffect(() => {
        fetchContacts();
    }, [user.id_bracelet]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // ENREGISTRER (AVEC VALIDATIONS) 
    const handleSubmit = async (e) => {
        e.preventDefault();

        // VALIDATION DU FORMAT +33 
        const telNettoye = form.telephone.trim();
        
        // On vérifie si ça commence par +33 ET si la longueur est correcte (+33 + 9 chiffres = 12)
        if (!telNettoye.startsWith('+33')) {
            alert("⚠️ Le numéro doit impérativement commencer par +33");
            return;
        }

        if (telNettoye.length !== 12) {
            alert("⚠️ Numéro invalide. Format attendu : +33612345678");
            return;
        }

        //  VÉRIFICATION DES DOUBLONS
        const doublon = contacts.find(c => {
            const memeEmail = c.email.toLowerCase() === form.email.toLowerCase();
            const memeTel = c.tel === telNettoye;
            return (memeEmail || memeTel) && c.id !== isEditing;
        });

        if (doublon) {
            alert("⚠️ Un contact possède déjà cet email ou ce numéro.");
            return;
        }

        //  ENVOI AU SERVEUR 
        const payload = {
            nom: form.nom,
            email: form.email,
            tel: telNettoye,
            id_user: user.id 
        };

        try {
            if (isEditing) {
                await api.put(`/contacts/${isEditing}`, payload);
                alert("✅ Contact mis à jour !");
            } else {
                await api.post('/contacts', payload);
                alert("✅ Contact ajouté !");
            }
            
            setForm({ nom: '', email: '', telephone: '' });
            setIsEditing(null);
            fetchContacts(); 
        } catch (error) {
            alert("❌ Erreur : Impossible d'enregistrer (Vérifiez les droits ADMIN)");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Supprimer ce contact ?")) return;
        try {
            await api.delete(`/contacts/${id}`, { data: { id_user: user.id } });
            fetchContacts();
        } catch (error) {
            alert("❌ Erreur lors de la suppression.");
        }
    };

    const startEdit = (c) => {
        setIsEditing(c.id);
        setForm({ nom: c.nom, email: c.email, telephone: c.tel });
    };

    return (
        <div className="dashboard-layout">
            <Sidebar />
            
            <main className="contact-content">
                <header className="contact-header">
                    <h1>👥 Contacts d'Urgence</h1>
                </header>

                {user.role === 'ADMIN' ? (
                    <section className="contact-form-card">
                        <h3>{isEditing ? "📝 Modifier" : "➕ Ajouter un proche"}</h3>
                        <form onSubmit={handleSubmit} className="contact-form-row">
                            <input type="text" name="nom" placeholder="Pseudo" value={form.nom} onChange={handleChange} required />
                            <input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} required />
                            {/* Petit message d'aide pour le téléphone */}
                            <input type="tel" name="telephone" placeholder="+33612345678" value={form.telephone} onChange={handleChange} required />
                            
                            <button type="submit" className={isEditing ? "btn-save" : "btn-add"}>
                                {isEditing ? "Valider" : "Ajouter"}
                            </button>
                            
                            {isEditing && (
                                <button type="button" className="btn-cancel" onClick={() => {setIsEditing(null); setForm({nom:'', email:'', telephone:''})}}>
                                    Annuler
                                </button>
                            )}
                        </form>
                    </section>
                ) : (
                    <div className="proche-notice">
                        ℹ️ Seul l'Administrateur peut modifier ces contacts.
                    </div>
                )}

                <section className="contact-table-container">
                    <table className="contact-table">
                        <thead>
                            <tr>
                                <th>Pseudo</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                {user.role === 'ADMIN' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.length > 0 ? (
                                contacts.map((c) => (
                                    <tr key={c.id}>
                                        <td>{c.nom}</td>
                                        <td>{c.email}</td>
                                        <td style={{fontWeight: 'bold', color: '#3687a4'}}>{c.tel}</td>
                                        {user.role === 'ADMIN' && (
                                            <td className="actions-cell">
                                                <button onClick={() => startEdit(c)} className="edit-icon">✏️</button>
                                                <button onClick={() => handleDelete(c.id)} className="delete-icon">🗑️</button>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={user.role === 'ADMIN' ? 4 : 3} className="empty-row">
                                        Aucun contact trouvé.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>
            </main>
        </div>
    );
};

export default Contact;