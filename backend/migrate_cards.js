const mysql = require('mysql2/promise');

async function migrateDB() {
    const pool = mysql.createPool('mysql://avnadmin:AVNS_KigeJIVdKiHwgR_Jr9z@mysql-6557793-ayzard95-7e66.d.aivencloud.com:17687/defaultdb?ssl-mode=REQUIRED');

    console.log("Starting Card Migration...");

    try {
        await pool.execute('ALTER TABLE comptes_bancaires ADD COLUMN type_carte VARCHAR(50) DEFAULT NULL AFTER type_compte');
        console.log("Added type_carte to comptes_bancaires");
    } catch (e) { console.log(e.message); }

    try {
        // Mettre à jour les comptes existants avec des cartes aléatoires
        await pool.execute('UPDATE comptes_bancaires SET type_carte = "visa" WHERE type_compte = "courant" AND id % 2 = 0');
        await pool.execute('UPDATE comptes_bancaires SET type_carte = "mastercard" WHERE type_compte = "courant" AND id % 2 != 0');
        console.log("Updated existing accounts with cards");
    } catch (e) { console.log(e.message); }

    process.exit(0);
}

migrateDB();
