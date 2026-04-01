const pool = require('../config/db');
require('dotenv').config();

const seedAdminTest = async () => {
    const userId = 8; // ID for admin_test@irisbank.fr

    try {
        console.log('Seeding accounts for admin_test (ID: 8)...');

        // Create 2 accounts
        const [acc1] = await pool.execute(
            'INSERT INTO comptes_bancaires (utilisateur_id, numero_compte, type_compte, solde, statut_compte) VALUES (?, ?, ?, ?, ?)',
            [userId, 'FR76-YBNK-0000-1111-2222-333', 'courant', 2500.00, 'actif']
        );

        const [acc2] = await pool.execute(
            'INSERT INTO comptes_bancaires (utilisateur_id, numero_compte, type_compte, solde, statut_compte) VALUES (?, ?, ?, ?, ?)',
            [userId, 'FR76-YBNK-9999-8888-7777-666', 'livret A', 15000.00, 'actif']
        );

        // Add some transactions for account 1
        const transactions = [
            [acc1.insertId, null, 'depot', 500.00, 'Salaire Mars'],
            [acc1.insertId, null, 'retrait', 50.00, 'Retrait DAB Paris'],
            [null, acc1.insertId, 'virement recu', 150.00, 'Remboursement Resto'],
            [acc1.insertId, acc2.insertId, 'virement emis', 200.00, 'Épargne auto']
        ];

        for (const tx of transactions) {
            await pool.execute(
                'INSERT INTO transactions (compte_source_id, compte_destinataire_id, type_transaction, montant, libelle) VALUES (?, ?, ?, ?, ?)',
                tx
            );
        }

        console.log('Seeding complete !');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding :', error);
        process.exit(1);
    }
};

seedAdminTest();
