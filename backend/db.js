require('dotenv').config(); // Charge les variables d'environnement
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,                       
    password: process.env.DB_PASSWORD,   
    database: process.env.DB_NAME        
});

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion SQL :', err.message);
    } else {
        console.log('Connecte a la BDD Safe-T-Wrist');
    }
});

module.exports = db;