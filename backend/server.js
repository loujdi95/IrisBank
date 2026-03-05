const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors({
    origin: '*', // En développement, on accepte tout. À restreindre en prod.
}));
app.use(express.json()); // Permet de lire le corps des requêtes en JSON
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));

// Test Route
app.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API IrisBank');
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur IrisBank démarré sur le port ${PORT}`);
});
