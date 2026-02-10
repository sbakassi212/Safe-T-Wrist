const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();

app.use(cors());

app.get('/', (req, res) => {
    res.send('Serveur opérationnel et relié à la BDD !');
});

app.listen(3000, () => {
    console.log("Serveur lancé sur le port 3000");
});