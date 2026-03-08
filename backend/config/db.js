const mysql = require('mysql2/promise');
require('dotenv').config();

// Création d'un pool de connexion pour la base de données
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Tester la connexion (optionnel, pratique au démarrage du serveur)
pool.getConnection()
    .then((conn) => {
        console.log('Connexion à la base de données MySQL (Aiven) réussie !');
        conn.release();
    })
    .catch((err) => {
        console.error('Erreur lors de la connexion à la base de données :', err);
    });

module.exports = pool;
