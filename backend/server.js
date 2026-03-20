const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Pour crypter
const jwt = require('jsonwebtoken'); // Pour le token
const db = require('./db'); // Ton fichier de connexion BDD
const path = require('path');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());
// On ne rend "public" QUE le dossier Front
app.use(express.static(path.join(__dirname, '../Front'))); 

// --- CONFIGURATION SECURITE ---
const SECRET_KEY = "mon_super_secret_safe_t_wrist"; // à changer ultérieurement pour plus de sécurité (ex: variable d'environnement)

// Petit test pour voir si le serveur est vivant
app.get('/', (req, res) => {
    res.send('Serveur API Safe-T-Wrist en ligne');
});

// ==========================================
// 🔐 MODULE AUTHENTIFICATION
// ==========================================

// 1. Inscription (Register)
app.post('/api/auth/register', async (req, res) => {
    // CORRECTION : On ne récupère plus le 'role' depuis req.body pour éviter les failles
    const { email, password, nom } = req.body;

    if (!email || !password || !nom) {
        return res.status(400).json({ error: "Champs manquants" });
    }

    try {
        const hash = await bcrypt.hash(password, 10);
        // CORRECTION : On force le rôle PROCHE pour toute nouvelle inscription
        const userRole = 'PROCHE'; 

        const sql = "INSERT INTO users (email, password_hash, nom, role) VALUES (?, ?, ?, ?)";
        db.query(sql, [email, hash, nom, userRole], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: "Email déjà utilisé" });
                return res.status(500).json({ error: "Erreur BDD" });
            }
            res.status(201).json({ message: "Utilisateur créé !" });
        });
    } catch (error) {
        res.status(500).json({ error: "Erreur serveur" });
    }
});

// 2. Connexion (Login)
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur BDD" });
        
        if (results.length === 0) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        const user = results[0];

        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (!isMatch) {
                return res.status(401).json({ error: "Email ou mot de passe incorrect" });
            }

            const token = jwt.sign(
                { id: user.id, role: user.role, nom: user.nom }, 
                SECRET_KEY, 
                { expiresIn: '24h' }
            );

            res.status(200).json({ 
                message: "Connexion réussie", 
                token: token,
                user: { 
                    id: user.id, 
                    nom: user.nom, 
                    role: user.role,
                    id_bracelet: user.id_bracelet 
                }
            });
        });
    });
});

// 3. Lier un bracelet à un utilisateur (Appairage) - VERSION DEBUG
app.put('/api/auth/link-bracelet', (req, res) => {
    const { email, id_bracelet } = req.body;

    if (!email || !id_bracelet) {
        return res.status(400).json({ error: "Email et ID bracelet requis" });
    }

    // On cherche d'abord si un Admin existe déjà
    const checkAdminSql = "SELECT id FROM users WHERE id_bracelet = ? AND role = 'ADMIN'";
    
    db.query(checkAdminSql, [id_bracelet], (err, results) => {
        if (err) {
            //  PREMIER POINT D'INSPECTION
            console.error(" ERREUR SQL (Étape SELECT) :", err);
            return res.status(500).json({ error: "Erreur BDD lors de la vérification" });
        }

        const isFirst = (results.length === 0);
        let updateSql = isFirst 
            ? "UPDATE users SET id_bracelet = ?, role = 'ADMIN' WHERE email = ?" 
            : "UPDATE users SET id_bracelet = ? WHERE email = ?";
        
        db.query(updateSql, [id_bracelet, email], (err, result) => {
            if (err) {
                // DEUXIÈME POINT D'INSPECTION (Le plus probable)
                console.error(" ERREUR SQL (Étape UPDATE) :", err);
                return res.status(500).json({ error: "Erreur BDD lors de la mise à jour" });
            }
            
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Utilisateur non trouvé" });
            }

            const msg = isFirst ? "Bracelet lié ! Vous êtes Administrateur." : "Bracelet lié en tant que Proche.";
            res.status(200).json({ message: msg });
        });
    });
});

// ==========================================
// 📡 ROUTE ACQUISITION : MESURES & ALERTES
// ==========================================

app.post('/api/measures', (req, res) => {
    const { id_bracelet, bpm, batterie } = req.body;

    if (!id_bracelet || !bpm || !batterie) {
        return res.status(400).json({ error: "Données manquantes" });
    }

    const sql = "INSERT INTO measures (id_bracelet, bpm, batterie, date_heure) VALUES (?, ?, ?, NOW())";
    
    db.query(sql, [id_bracelet, bpm, batterie], (err, result) => {
        if (err) {
            console.error("Erreur SQL (Mesures) :", err);
            return res.status(500).json({ error: "Erreur BDD" });
        }
        console.log(`Mesure enregistrée ! Bracelet: ${id_bracelet}, BPM: ${bpm}`);
        res.status(201).json({ message: "Succès" });
    });
});

app.post('/api/alerts', (req, res) => {
    const { id_bracelet, type_alerte } = req.body;

    if (!id_bracelet || !type_alerte) {
        return res.status(400).json({ error: "Données manquantes" });
    }

    const sql = "INSERT INTO alerts (id_bracelet, type_alerte, statut, date_heure) VALUES (?, ?, 0, NOW())";

    db.query(sql, [id_bracelet, type_alerte], (err, result) => {
        if (err) {
            console.error("Erreur SQL (Alertes) :", err);
            return res.status(500).json({ error: "Erreur BDD" });
        }
        console.log(`ALERTE REÇUE ! Type: ${type_alerte}`);
        res.status(201).json({ message: "Alerte traitée" });
    });
});

// ==========================================
// 📊 MODULE CONSULTATION : DASHBOARD & HISTORIQUE
// ==========================================

app.get('/api/history/:id_bracelet', (req, res) => {
    const id_bracelet = req.params.id_bracelet;
    const sql = "SELECT * FROM alerts WHERE id_bracelet = ? ORDER BY date_heure DESC";

    db.query(sql, [id_bracelet], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la récupération de l'historique." });
        res.status(200).json(results);
    });
});

app.get('/api/last-measure/:id_bracelet', (req, res) => {
    const id_bracelet = req.params.id_bracelet;
    const sql = "SELECT * FROM measures WHERE id_bracelet = ? ORDER BY date_heure DESC LIMIT 1";

    db.query(sql, [id_bracelet], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur lors de la récupération des mesures." });
        if (results.length === 0) return res.status(404).json({ message: "Aucune mesure disponible pour ce bracelet." });
        res.status(200).json(results[0]);
    });
});

// ==========================================
// 📞 GESTION DES CONTACTS D'URGENCE (ADMIN ONLY)
// ==========================================

app.post('/api/contacts', (req, res) => {
    const { nom, tel, email, id_user } = req.body;

    if (!nom || !tel || !id_user) return res.status(400).json({ error: "Le nom, le tel et l'id_user sont obligatoires." });

    const telRegex = /^\+33\d{9}$/;
    if (!telRegex.test(tel)) return res.status(400).json({ error: "Format invalide. Le numéro doit être au format +33XXXXXXXXX." });

    const checkRoleSql = "SELECT role FROM users WHERE id = ?";
    db.query(checkRoleSql, [id_user], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur de connexion à la BDD." });
        if (results.length === 0) return res.status(404).json({ error: "Utilisateur introuvable." });
        if (results[0].role !== 'ADMIN') return res.status(403).json({ error: "Accès refusé : Seul un administrateur peut ajouter un contact." });

        const insertSql = "INSERT INTO contacts (nom, tel, email, id_user) VALUES (?, ?, ?, ?)";
        db.query(insertSql, [nom, tel, email, id_user], (err, result) => {
            if (err) return res.status(500).json({ error: "Erreur lors de l'ajout du contact." });
            res.status(201).json({ message: "Contact ajouté avec succès !", id_contact: result.insertId });
        });
    });
});

app.put('/api/contacts/:id', (req, res) => {
    const id_contact = req.params.id;
    const { nom, tel, email, id_user } = req.body;

    if (!id_user) return res.status(400).json({ error: "L'id_user est obligatoire pour vérifier les droits." });

    if (tel) {
        const telRegex = /^\+33\d{9}$/;
        if (!telRegex.test(tel)) return res.status(400).json({ error: "Format invalide. Le numéro doit être au format +33XXXXXXXXX." });
    }

    const checkRoleSql = "SELECT role FROM users WHERE id = ?";
    db.query(checkRoleSql, [id_user], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur BDD." });
        if (results.length === 0) return res.status(404).json({ error: "Utilisateur introuvable." });
        if (results[0].role !== 'ADMIN') return res.status(403).json({ error: "Accès refusé : Seul un administrateur peut modifier un contact." });

        const updateSql = "UPDATE contacts SET nom = COALESCE(?, nom), tel = COALESCE(?, tel), email = COALESCE(?, email) WHERE id = ?";
        db.query(updateSql, [nom, tel, email, id_contact], (err, result) => {
            if (err) return res.status(500).json({ error: "Erreur lors de la modification." });
            if (result.affectedRows === 0) return res.status(404).json({ error: "Contact introuvable." });
            res.status(200).json({ message: "Contact mis à jour avec succès !" });
        });
    });
});

app.delete('/api/contacts/:id', (req, res) => {
    const id_contact = req.params.id;
    const { id_user } = req.body;

    if (!id_user) return res.status(400).json({ error: "L'id_user est obligatoire pour vérifier les droits." });

    const checkRoleSql = "SELECT role FROM users WHERE id = ?";
    db.query(checkRoleSql, [id_user], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur BDD." });
        if (results.length === 0) return res.status(404).json({ error: "Utilisateur introuvable." });
        if (results[0].role !== 'ADMIN') return res.status(403).json({ error: "Accès refusé : Seul un administrateur peut supprimer un contact." });

        const deleteSql = "DELETE FROM contacts WHERE id = ?";
        db.query(deleteSql, [id_contact], (err, result) => {
            if (err) return res.status(500).json({ error: "Erreur lors de la suppression." });
            if (result.affectedRows === 0) return res.status(404).json({ error: "Contact introuvable." });
            res.status(200).json({ message: "Contact supprimé avec succès !" });
        });
    });
});

// ==========================================
// LANCEMENT DU SERVEUR
// ==========================================
// CORRECTION : Le app.listen doit toujours être à la fin du fichier !
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});