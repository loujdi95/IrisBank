const pool = require('../config/db');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const createAdmin = async () => {
    const email = 'admin_test@irisbank.fr';
    const password = 'Admin123!';
    const prenom = 'Admin';
    const nom = 'Test';

    try {
        // Vérifier si l'utilisateur existe déjà
        const [existing] = await pool.execute('SELECT * FROM utilisateurs WHERE email = ?', [email]);
        
        if (existing.length > 0) {
            console.log('L\'utilisateur admin_test existe déjà. Mise à jour en tant qu\'admin...');
            await pool.execute('UPDATE utilisateurs SET est_admin = 1 WHERE email = ?', [email]);
            console.log('Utilisateur mis à jour !');
            process.exit(0);
        }

        // Hachage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertion
        await pool.execute(
            'INSERT INTO utilisateurs (prenom, nom, email, mot_de_passe, est_admin) VALUES (?, ?, ?, ?, ?)',
            [prenom, nom, email, hashedPassword, 1]
        );

        console.log('--------------------------------------------------');
        console.log('Compte ADMIN créé avec succès !');
        console.log(`Email : ${email}`);
        console.log(`Mot de passe : ${password}`);
        console.log('--------------------------------------------------');
        process.exit(0);
    } catch (error) {
        console.error('Erreur lors de la création de l\'admin :', error);
        process.exit(1);
    }
};

createAdmin();
