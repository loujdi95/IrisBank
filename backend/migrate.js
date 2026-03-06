const mysql = require('mysql2/promise');

async function migrateDB() {
    const pool = mysql.createPool('mysql://avnadmin:AVNS_KigeJIVdKiHwgR_Jr9z@mysql-6557793-ayzard95-7e66.d.aivencloud.com:17687/defaultdb?ssl-mode=REQUIRED');

    console.log("Starting DB Migration...");

    try {
        await pool.execute('ALTER TABLE utilisateurs ADD COLUMN prenom VARCHAR(100) DEFAULT NULL AFTER id');
        console.log("Added prenom to utilisateurs");
    } catch (e) { console.log(e.message); }

    try {
        await pool.execute('ALTER TABLE utilisateurs ADD COLUMN nom VARCHAR(100) DEFAULT NULL AFTER prenom');
        console.log("Added nom to utilisateurs");
    } catch (e) { console.log(e.message); }

    try {
        await pool.execute('ALTER TABLE comptes_bancaires ADD COLUMN devise VARCHAR(3) DEFAULT "EUR" AFTER solde');
        console.log("Added devise to comptes_bancaires");
    } catch (e) { console.log(e.message); }

    // Let's also update database.sql to document these changes
    console.log("Migration complete.");
    process.exit(0);
}

migrateDB();
