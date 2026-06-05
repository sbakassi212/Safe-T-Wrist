require('dotenv').config(); 

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const db = require('./db'); // Connexion a la base de donnees securisee

// ==========================================
// CONFIGURATION DES API EXTERNES
// ==========================================

// --- API TWILIO (WhatsApp/SMS) ---
const twilio = require('twilio');
const twilioClient = new twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const sendWhatsApp = (numeroDestinataire, message) => {
    twilioClient.messages.create({
        body: `URGENCE SAFE-T-WRIST\n\n${message}`,
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${numeroDestinataire}`
    })
        .then(msg => console.log(`Message WhatsApp envoye ! ID: ${msg.sid}`))
        .catch(error => console.error("Erreur Twilio WhatsApp :", error.message));
};

// --- API RESEND (E-mail) ---
const { Resend } = require('resend');
const resendClient = new Resend(process.env.RESEND_API_KEY);

const sendEmail = (emailDestinataire, nomPatient, typeAlerte) => {
    resendClient.emails.send({
        from: 'onboarding@resend.dev',
        to: emailDestinataire,
        subject: `ALERTE SAFE-T-WRIST : ${typeAlerte}`,
        html: `<h2>Urgence Medicale</h2>
               <p>Le bracelet de <strong>${nomPatient}</strong> vient de detecter une alerte de type : <strong>${typeAlerte}</strong>.</p>
               <p>Veuillez prendre contact ou verifier la situation immediatement.</p>`
    })
        .then(data => console.log(`E-mail envoye avec succes ! ID: ${data.id}`))
        .catch(error => console.error("Erreur API Email :", error.message));
};

// ==========================================
// INITIALISATION DE L'APPLICATION
// ==========================================

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, '../Front')));

const SECRET_KEY = process.env.SECRET_KEY; // Cle secrete importee du .env

// Test de vie du serveur
app.get('/', (req, res) => res.send('Serveur API Safe-T-Wrist en ligne et securise.'));


// ==========================================
// MODULE AUTHENTIFICATION
// ==========================================

// Inscription (Role PROCHE force par securite)
app.post('/api/auth/register', async (req, res) => {
    const { email, password, nom } = req.body;
    if (!email || !password || !nom) return res.status(400).json({ error: "Champs manquants" });

    try {
        const hash = await bcrypt.hash(password, 10);
        const sql = "INSERT INTO users (email, password_hash, nom, role) VALUES (?, ?, ?, 'PROCHE')";

        db.query(sql, [email, hash, nom], (err, result) => {
            if (err) return err.code === 'ER_DUP_ENTRY' ? res.status(409).json({ error: "Email deja utilise" }) : res.status(500).json({ error: "Erreur BDD" });
            res.status(201).json({ message: "Utilisateur cree !" });
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// Connexion
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err || results.length === 0) return res.status(401).json({ error: "Identifiants incorrects" });

        const user = results[0];
        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (!isMatch) return res.status(401).json({ error: "Identifiants incorrects" });

            const token = jwt.sign({ id: user.id, role: user.role, nom: user.nom }, SECRET_KEY, { expiresIn: '24h' });
            res.status(200).json({ message: "Connexion reussie", token, user: { id: user.id, nom: user.nom, role: user.role, id_bracelet: user.id_bracelet } });
        });
    });
});

// Appairage du bracelet
app.put('/api/auth/link-bracelet', (req, res) => {
    const { email, id_bracelet } = req.body;
    if (!email || !id_bracelet) return res.status(400).json({ error: "Email et ID bracelet requis" });

    db.query("SELECT id FROM users WHERE id_bracelet = ? AND role = 'ADMIN'", [id_bracelet], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur verification BDD" });

        const isFirst = (results.length === 0);
        const updateSql = isFirst ? "UPDATE users SET id_bracelet = ?, role = 'ADMIN' WHERE email = ?" : "UPDATE users SET id_bracelet = ? WHERE email = ?";

        db.query(updateSql, [id_bracelet, email], (err, result) => {
            if (err || result.affectedRows === 0) return res.status(500).json({ error: "Erreur mise a jour ou utilisateur introuvable" });
            res.status(200).json({ message: isFirst ? "Bracelet lie ! Vous etes Administrateur." : "Bracelet lie en tant que Proche." });
        });
    });
});



// ==========================================
// MIDDLEWARE DE SECURITE (JWT)
// ==========================================

const verifierToken = (req, res, next) => {
    // Récupèration du Token
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: "Accès refusé. Token manquant." });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ error: "Token invalide ou expiré." });
        }
        
        req.user = decoded; 
        next(); // Le token est bon, on laisse passer à la route demandée
    });
};



// ==========================================
// ACQUISITION DES DONNEES ET ALERTES
// ==========================================

// Enregistrer une mesure normale
app.post('/api/measures', (req, res) => {
    const { id_bracelet, bpm, batterie } = req.body;
    if (!id_bracelet || !bpm || !batterie) return res.status(400).json({ error: "Donnees manquantes" });

    db.query("INSERT INTO measures (id_bracelet, bpm, batterie, date_heure) VALUES (?, ?, ?, NOW())", [id_bracelet, bpm, batterie], (err) => {
        if (err) return res.status(500).json({ error: "Erreur BDD" });
        res.status(201).json({ message: "Mesure enregistree" });
    });
});

// Declencher une alerte (Chute/BPM anormal)
app.post('/api/alerts', (req, res) => {
    const { id_bracelet, type_alerte } = req.body;
    if (!id_bracelet || !type_alerte) return res.status(400).json({ error: "Donnees manquantes" });

    db.query("INSERT INTO alerts (id_bracelet, type_alerte, statut, date_heure) VALUES (?, ?, 0, NOW())", [id_bracelet, type_alerte], (err) => {
        if (err) return res.status(500).json({ error: "Erreur BDD" });

        console.log(`ALERTE RECUE ! Type: ${type_alerte}`);

        const sqlContacts = `SELECT c.tel, c.email, c.nom AS nom_contact, u.nom AS nom_patient FROM contacts c JOIN users u ON c.id_user = u.id WHERE u.id_bracelet = ?`;
        db.query(sqlContacts, [id_bracelet], (err, contacts) => {
            if (!err && contacts.length > 0) {
                contacts.forEach(contact => {
                    // Option WhatsApp (Decommenter si necessaire)
                    sendWhatsApp(contact.tel, `Alerte '${type_alerte}' declenchee pour ${contact.nom_patient}.`);

                    if (contact.email) {
                        sendEmail(contact.email, contact.nom_patient, type_alerte);
                    }
                });
            } else {
                console.log("Aucun contact d'urgence trouve. Notifications annulees.");
            }
        });

        res.status(201).json({ message: "Alerte traitee et notifications declenchees" });
    });
});


// ==========================================
// DASHBOARD ET HISTORIQUE
// ==========================================

app.get('/api/history/:id_bracelet', verifierToken, (req, res) => {
    db.query("SELECT * FROM alerts WHERE id_bracelet = ? ORDER BY date_heure DESC", [req.params.id_bracelet], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur historique" });
        res.status(200).json(results);
    });
});

app.get('/api/last-measure/:id_bracelet', verifierToken, (req, res) => {
    db.query("SELECT * FROM measures WHERE id_bracelet = ? ORDER BY date_heure DESC LIMIT 1", [req.params.id_bracelet], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur mesures" });
        if (results.length === 0) return res.status(404).json({ message: "Aucune mesure" });
        res.status(200).json(results[0]);
    });
});


// ==========================================
// GESTION DES CONTACTS (CRUD ADMIN SECURISE)
// ==========================================

app.post('/api/contacts', verifierToken, (req, res) => {
    const { nom, tel, email } = req.body; 
    
    const id_user = req.user.id; 

    // Vérification du rôle 
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: "Accès refusé. Réservé aux administrateurs." });
    }

    if (!nom || !tel) return res.status(400).json({ error: "Données incomplètes" });

    db.query("INSERT INTO contacts (nom, tel, email, id_user) VALUES (?, ?, ?, ?)", [nom, tel, email, id_user], (err, result) => {
        if (err) return res.status(500).json({ error: "Erreur ajout" });
        res.status(201).json({ message: "Contact ajouté", id_contact: result.insertId });
    });
});

app.put('/api/contacts/:id', verifierToken, (req, res) => {
    const { nom, tel, email } = req.body;

    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: "Accès refusé. Réservé aux administrateurs." });
    }

    db.query("UPDATE contacts SET nom = COALESCE(?, nom), tel = COALESCE(?, tel), email = COALESCE(?, email) WHERE id = ?", [nom, tel, email, req.params.id], (err, result) => {
        if (err || result.affectedRows === 0) return res.status(404).json({ error: "Introuvable" });
        res.status(200).json({ message: "Contact mis à jour" });
    });
});

app.delete('/api/contacts/:id', verifierToken, (req, res) => {
    if (req.user.role !== 'ADMIN') {
        return res.status(403).json({ error: "Accès refusé. Réservé aux administrateurs." });
    }

    db.query("DELETE FROM contacts WHERE id = ?", [req.params.id], (err, result) => {
        if (err || result.affectedRows === 0) return res.status(404).json({ error: "Introuvable" });
        res.status(200).json({ message: "Contact supprimé" });
    });
});


// Recuperer la liste des contacts 
app.get('/api/contacts/:id_bracelet', verifierToken, (req, res) => {
    const id_bracelet = req.params.id_bracelet;

    const sql = `
        SELECT c.id, c.nom, c.tel, c.email 
        FROM contacts c 
        JOIN users u ON c.id_user = u.id 
        WHERE u.id_bracelet = ?
    `;

    db.query(sql, [id_bracelet], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la récupération des contacts" });
        res.status(200).json(results);
    });
});


// ==========================================
// DEMARRAGE DU SERVEUR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur demarre sur le port ${PORT}`);
});