const mysql = require('mysql2/promise');

async function migrateMessaging() {
    const pool = mysql.createPool('mysql://avnadmin:AVNS_KigeJIVdKiHwgR_Jr9z@mysql-6557793-ayzard95-7e66.d.aivencloud.com:17687/defaultdb?ssl-mode=REQUIRED');

    console.log("Starting Messaging Migration...");

    try {
        // 1. Add conseiller_id to utilisateurs
        await pool.execute('ALTER TABLE utilisateurs ADD COLUMN conseiller_id INT DEFAULT NULL');
        console.log("Added conseiller_id to utilisateurs");
    } catch (e) { console.log("conseiller_id already exists or error:", e.message); }

    try {
        // 2. Create messages table
        await pool.execute(`
            CREATE TABLE IF NOT EXISTS messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                expediteur_id INT NOT NULL,
                destinataire_id INT NOT NULL,
                contenu TEXT NOT NULL,
                date_envoi TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                lu BOOLEAN DEFAULT FALSE,
                FOREIGN KEY (expediteur_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
                FOREIGN KEY (destinataire_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
            )
        `);
        console.log("Created messages table");
    } catch (e) { console.log("Error creating messages table:", e.message); }

    try {
        // 3. Create Advisor account
        const [existing] = await pool.execute("SELECT id FROM utilisateurs WHERE email = 'vincent.depeaux@irisbank.fr'");
        let advisorId;
        if (existing.length === 0) {
            const [res] = await pool.execute(
                'INSERT INTO utilisateurs (prenom, nom, email, mot_de_passe, est_admin) VALUES (?, ?, ?, ?, ?)',
                ['Vincent', 'Depeaux', 'vincent.depeaux@irisbank.fr', '$2b$10$UnHashBcryptGeneriquePourMdp123!', true]
            );
            advisorId = res.insertId;
            console.log("Created Advisor: Vincent Depeaux (ID:", advisorId, ")");
        } else {
            advisorId = existing[0].id;
            console.log("Advisor already exists (ID:", advisorId, ")");
        }

        // 4. Assign this advisor to all users who don't have one (and aren't the advisor themselves)
        await pool.execute('UPDATE utilisateurs SET conseiller_id = ? WHERE conseiller_id IS NULL AND id != ?', [advisorId, advisorId]);
        console.log("Assigned advisor to all users");

    } catch (e) { console.log("Error seeding advisor/assigning:", e.message); }

    console.log("Messaging Migration complete.");
    process.exit(0);
}

migrateMessaging();
