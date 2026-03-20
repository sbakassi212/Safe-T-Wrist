const mysql = require('mysql2');

const db = mysql.createConnection({
    host: '172.29.18.99',
    user: 'tp2',                       
    password: 'ismailadamyahyaanis2014@',   
    database: 'safe_t_wrist'         
});

db.connect((err) => {
    if (err) {
        console.error('Erreur de connexion SQL :', err);
        console.error('Vérifie que le mot de passe de "tp2" est correct.');
    } else {
        console.log('Connecté à la BDD Safe-T-Wrist');
    }
});

module.exports = db;