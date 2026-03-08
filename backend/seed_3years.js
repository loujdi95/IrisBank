const mysql = require('mysql2/promise');

async function seedHistory() {
    // 1. Connexion à la BDD
    const dbUri = process.env.DB_URI || 'mysql://avnadmin:AVNS_KigeJIVdKiHwgR_Jr9z@mysql-6557793-ayzard95-7e66.d.aivencloud.com:17687/defaultdb?ssl-mode=REQUIRED';
    const pool = mysql.createPool(dbUri);

    console.log("Starting 3-year historical data generation...");

    try {
        // 2. Récupérer tous les comptes existants
        const [comptes] = await pool.query("SELECT id FROM comptes_bancaires");

        if (comptes.length === 0) {
            console.log("Aucun compte trouvé. Veuillez d'abord créer des comptes.");
            process.exit(0);
        }

        // 3. Pour chaque compte, générer des transactions sur les 36 derniers mois
        for (const compte of comptes) {
            const compteId = compte.id;
            const today = new Date();

            let queryValues = [];

            const descriptionsRecettes = ["Virement Salaire", "Remboursement Sante", "Virement CAF", "Virement Recu", "Interets Generes"];
            const descriptionsDepenses = ["Prelevement EDF", "Prelevement Internet", "Carte Supermarche", "Carte Restaurant", "Prelevement Abonnement", "Retrait DAB", "Achat Amazon"];

            // Générer environ 10 à 20 transactions par mois pendant 36 mois
            for (let moisAgo = 36; moisAgo >= 0; moisAgo--) {
                const nbTransactions = Math.floor(Math.random() * 10) + 10; // 10 to 19 txs

                for (let i = 0; i < nbTransactions; i++) {
                    // Date aléatoire dans le mois
                    const txDate = new Date(today);
                    txDate.setMonth(today.getMonth() - moisAgo);
                    txDate.setDate(Math.floor(Math.random() * 28) + 1); // 1 au 28 pour éviter les débordements

                    const estUneRecette = Math.random() > 0.8; // 20% recettes, 80% dépenses
                    const description = estUneRecette
                        ? descriptionsRecettes[Math.floor(Math.random() * descriptionsRecettes.length)]
                        : descriptionsDepenses[Math.floor(Math.random() * descriptionsDepenses.length)];

                    // Montant aléatoire
                    let montant = estUneRecette
                        ? (Math.random() * 2000 + 100).toFixed(2) // 100 à 2100 EUR
                        : -(Math.random() * 100 + 5).toFixed(2);  // -5 à -105 EUR

                    const type = estUneRecette ? 'depot' : 'retrait';

                    const dateStr = txDate.toISOString().slice(0, 19).replace('T', ' ');

                    // Assume table is `transactions` and columns: compte_source_id, compte_destinataire_id, type_transaction, montant, libelle, date_transaction
                    // On va mettre compte_source_id = compteId, et compte_destinataire_id = null pour faire simple.
                    queryValues.push(`(${compteId}, NULL, '${type}', ${montant}, '${dateStr}', '${description}')`);
                }
            }

            // Execute insert by chunks to avoid too large query
            const chunkSize = 500;
            for (let i = 0; i < queryValues.length; i += chunkSize) {
                const chunk = queryValues.slice(i, i + chunkSize);
                await pool.query(`INSERT INTO transactions (compte_source_id, compte_destinataire_id, type_transaction, montant, date_transaction, libelle) VALUES ${chunk.join(',')}`);
            }

            console.log(`Généré ~${queryValues.length} transactions depuis 3 ans pour le compte ${compteId}`);
        }

        console.log("Generation completed successfully!");

    } catch (e) {
        console.error("Fatale erreur:", e);
    }

    process.exit(0);
}

seedHistory();
