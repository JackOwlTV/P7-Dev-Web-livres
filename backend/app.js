const express = require('express');
const cors = require("cors");

const app = express();

// Configurer les options CORS pour autoriser toutes les origines
const corsOptions = {
    origin: "*",
    optionsSuccessStatus: 200,
};

// Activer CORS pour toutes les routes
app.use(cors(corsOptions));


app.use((req, res) => {
    res.json({ message: 'Votre requête a bien été reçue !' });
});

module.exports = app;
