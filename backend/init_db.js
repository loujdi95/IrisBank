const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initDB() {
    console.log('Connexion à la base Aiven...');
    const connection = await mysql.createConnection(process.env.MYSQL_URL + "&multipleStatements=true");

    console.log('Lecture du fichier SQL...');
    const sqlFilePath = path.join(__dirname, 'database.sql');
    const sql = fs.readFileSync(sqlFilePath, 'utf8');

    console.log('Exécution des requêtes (Création des tables et données)...');
    try {
        await connection.query(sql);
        console.log('✅ Base de données initialisée avec succès sur Aiven !');
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation :', error.message);
    } finally {
        await connection.end();
    }
}

initDB();
