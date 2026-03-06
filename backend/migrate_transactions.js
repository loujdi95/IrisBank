const mysql = require('mysql2/promise');

async function migrateDB() {
    const pool = mysql.createPool('mysql://avnadmin:AVNS_KigeJIVdKiHwgR_Jr9z@mysql-6557793-ayzard95-7e66.d.aivencloud.com:17687/defaultdb?ssl-mode=REQUIRED');

    console.log("Starting Transaction Table Migration...");

    try {
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS transactions (
                id INT AUTO_INCREMENT PRIMARY KEY,
                compte_source_id INT NULL,
                compte_dest_id INT NULL,
                type ENUM('virement', 'depot', 'retrait') NOT NULL,
                montant DECIMAL(15, 2) NOT NULL,
                date_transaction TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                description VARCHAR(255),
                FOREIGN KEY (compte_source_id) REFERENCES comptes_bancaires(id) ON DELETE SET NULL,
                FOREIGN KEY (compte_dest_id) REFERENCES comptes_bancaires(id) ON DELETE SET NULL
            )
        `);
        console.log("Created transactions table successfully.");
    } catch (e) { console.log("Error creating table: ", e.message); }

    process.exit(0);
}

migrateDB();
