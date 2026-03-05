const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt'); // Pour crypter
const jwt = require('jsonwebtoken'); // Pour le token
const db = require('./db'); // Ton fichier de connexion BDD

const app = express();

// Middleware pour lire le JSON
app.use(express.json());
app.use(cors());



// --- CONFIGURATION SECURITE ---
const SECRET_KEY = "mon_super_secret_safe_t_wrist"; // à changer ultérieurement pour plus de sécurité (ex: variable d'environnement)

// ==========================================
// 🔐 MODULE AUTHENTIFICATION
// ==========================================

// 1. Inscription (Register)
app.post('/api/auth/register', async (req, res) => {
    const { email, password, nom, role } = req.body;

    if (!email || !password || !nom) {
        return res.status(400).json({ error: "Champs manquants" });
    }

    try {
        // Hachage du mot de passe
        const hash = await bcrypt.hash(password, 10);
        const userRole = role || 'PROCHE'; 

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

    // On cherche l'utilisateur par son email
    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Erreur BDD" });
        
        // 1. Vérifier si l'utilisateur existe
        if (results.length === 0) {
            return res.status(401).json({ error: "Email ou mot de passe incorrect" });
        }

        const user = results[0];

        // 2. Comparer le mot de passe envoyé avec le hash crypté
        bcrypt.compare(password, user.password_hash, (err, isMatch) => {
            if (!isMatch) {
                return res.status(401).json({ error: "Email ou mot de passe incorrect" });
            }

            // 3. Générer le Token (Le "Pass VIP" valable 24h)
            const token = jwt.sign(
                { id: user.id, role: user.role, nom: user.nom }, 
                SECRET_KEY, 
                { expiresIn: '24h' }
            );

            // 4. Réponse Finale (Avec le Token ET l'info du bracelet)
            res.status(200).json({ 
                message: "Connexion réussie", 
                token: token,
                user: { 
                    id: user.id, 
                    nom: user.nom, 
                    role: user.role,
                    id_bracelet: user.id_bracelet // <--- Info cruciale pour Teddy !
                }
            });
        });
    });
});




// 3. Lier un bracelet à un utilisateur (Appairage)
app.put('/api/auth/link-bracelet', (req, res) => {
    const { email, id_bracelet } = req.body;

    if (!email || !id_bracelet) {
        return res.status(400).json({ error: "Email et ID bracelet requis" });
    }

    // On met à jour l'utilisateur pour lui ajouter le bracelet
    const sql = "UPDATE users SET id_bracelet = ? WHERE email = ?";
    
    db.query(sql, [id_bracelet, email], (err, result) => {
        if (err) return res.status(500).json({ error: "Erreur BDD" });
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Utilisateur non trouvé" });
        }

        res.status(200).json({ message: "Bracelet lié avec succès !" });
    });
});







// ==========================================
// 1. ROUTE ACQUISITION : MESURES
// ==========================================
app.post('/api/measures', (req, res) => {
    // On récupère les infos envoyées par le bracelet
    const { id_bracelet, bpm, batterie } = req.body;

    // Vérification basique
    if (!id_bracelet || !bpm || !batterie) {
        return res.status(400).json({ error: "Données manquantes" });
    }

    // Requête SQL 
    // On utilise 'date_heure' et NOW() pour l'heure actuelle
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

// ==========================================
// 2. ROUTE ACQUISITION : ALERTES (Chute)
// ==========================================
app.post('/api/alerts', (req, res) => {
    const { id_bracelet, type_alerte } = req.body;

    if (!id_bracelet || !type_alerte) {
        return res.status(400).json({ error: "Données manquantes" });
    }

    // Requête SQL adaptée à ton MCD :
    // - 'type_alerte' au lieu de 'type'
    // - On met 'statut' à 0 (pour dire "Non traité/Nouveau")
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

// Petit test pour voir si le serveur est vivant
app.get('/', (req, res) => {
    res.send('Serveur API Safe-T-Wrist en ligne');
});

// Lancement
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});

// mettre le back en privé 
const path = require('path');

// On ne rend "public" QUE le dossier Front
app.use(express.static(path.join(__dirname, '../Front'))); //comme le back nest pas dedans il nest pas public, mais le front oui (pour que les utilisateurs puissent y accéder)

