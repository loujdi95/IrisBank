const express = require('express');
const cors = require('cors');
require('dotenv').config(); // Load environment variables including OPENAI_API_KEY

const app = express();

// Middlewares
app.use(cors({
    origin: '*', // En développement, on accepte tout. À restreindre en prod.
}));
app.use(express.json()); // Permet de lire le corps des requêtes en JSON
app.use(express.urlencoded({ extended: true }));

// Debug Middleware - Log all requests
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    if (req.body && Object.keys(req.body).length > 0) {
        const bodyCopy = { ...req.body };
        if (bodyCopy.password) bodyCopy.password = '********';
        console.log('Body:', bodyCopy);
    }
    next();
});

// Startup Check
if (!process.env.JWT_SECRET) {
    console.warn('WARNING: JWT_SECRET is not defined in .env! Authentication will fail.');
}

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/cards', require('./routes/cardRoutes'));

// Test Route
app.get('/', (req, res) => {
    res.send('Bienvenue sur l\'API IrisBank');
});

// Lancement du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur IrisBank démarré sur le port ${PORT}`);
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error('CRITICAL ERROR:', err);
    res.status(500).json({
        message: 'Une erreur interne est survenue',
        error: err.message
    });
});
