const express = require('express');
const cors = require('cors');
const db = require('./db'); // Ton fichier de connexion BDD

const app = express();

// Middleware pour lire le JSON
app.use(express.json());
app.use(cors());

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
    res.send('Serveur API Safe-T-Wrist en ligne 🟢');
});

// Lancement
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});