const mysql = require('mysql2/promise');

async function migrateCards() {
    const pool = mysql.createPool('mysql://avnadmin:AVNS_KigeJIVdKiHwgR_Jr9z@mysql-6557793-ayzard95-7e66.d.aivencloud.com:17687/defaultdb?ssl-mode=REQUIRED');

    console.log("Starting Card Migration...");

    try {
        // 1. Create cartes table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS cartes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                utilisateur_id INT NOT NULL,
                compte_id INT NOT NULL,
                numero_masque VARCHAR(25) NOT NULL,
                type_carte VARCHAR(50) DEFAULT 'Visa On line',
                plafond_paiement DECIMAL(15, 2) DEFAULT 2300.00,
                plafond_retrait DECIMAL(15, 2) DEFAULT 1000.00,
                depense_actuelle DECIMAL(15, 2) DEFAULT 0.00,
                retrait_actuel DECIMAL(15, 2) DEFAULT 0.00,
                statut ENUM('actif', 'bloque', 'opposition') DEFAULT 'actif',
                date_expiration VARCHAR(10) DEFAULT '06/27',
                date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (utilisateur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
                FOREIGN KEY (compte_id) REFERENCES comptes_bancaires(id) ON DELETE CASCADE
            )
        `);
        console.log("Created cartes table");
    } catch (e) { 
        console.log("Error creating cards table or already exists:", e.message); 
    }

    try {
        // 2. Seed some cards for existing accounts
        const [accounts] = await pool.execute("SELECT id, utilisateur_id, numero_compte FROM comptes_bancaires WHERE type_compte = 'courant'");
        
        for (const acc of accounts) {
            const [existing] = await pool.execute("SELECT id FROM cartes WHERE compte_id = ?", [acc.id]);
            if (existing.length === 0) {
                const last4 = acc.numero_compte.slice(-4);
                const masked = `4977 56XX XXXX ${last4}`;
                await pool.execute(
                    'INSERT INTO cartes (utilisateur_id, compte_id, numero_masque, depense_actuelle) VALUES (?, ?, ?, ?)',
                    [acc.utilisateur_id, acc.id, masked, 1585.18] // Seed the expense from the screenshot
                );
                console.log(`Seeded card for account ${acc.id}`);
            }
        }
    } catch (e) {
        console.log("Error seeding cards:", e.message);
    }

    console.log("Card Migration complete.");
    process.exit(0);
}

migrateCards();
