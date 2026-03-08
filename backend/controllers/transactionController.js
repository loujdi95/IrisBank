const pool = require('../config/db');

// @desc    Créer un virement entre comptes
// @route   POST /api/transactions/transfer
// @access  Private
const createTransfer = async (req, res) => {
    const { sourceId, destIban, montant, description } = req.body;

    if (!sourceId || !destIban || !montant || montant <= 0) {
        return res.status(400).json({ message: 'Données de virement invalides.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // 1. Vérifier compte source
        const [sourceAccs] = await connection.execute(
            'SELECT id, solde FROM comptes_bancaires WHERE id = ? AND utilisateur_id = ?',
            [sourceId, req.user.id]
        );

        if (sourceAccs.length === 0) throw new Error('Compte source introuvable ou non autorisé.');
        const sourceAcc = sourceAccs[0];

        if (parseFloat(sourceAcc.solde) < montant) throw new Error('Solde insuffisant.');

        // 2. Vérifier compte destination via IBAN
        const [destAccs] = await connection.execute(
            'SELECT id FROM comptes_bancaires WHERE numero_compte = ?',
            [destIban]
        );

        if (destAccs.length === 0) throw new Error('Compte bénéficiaire introuvable.');
        const destAcc = destAccs[0];

        if (sourceAcc.id === destAcc.id) throw new Error("Vous ne pouvez pas virer de l'argent sur le même compte.");

        // 3. Effectuer le virement
        await connection.execute(
            'UPDATE comptes_bancaires SET solde = solde - ? WHERE id = ?',
            [montant, sourceAcc.id]
        );

        await connection.execute(
            'UPDATE comptes_bancaires SET solde = solde + ? WHERE id = ?',
            [montant, destAcc.id]
        );

        // 4. Enregistrer la transaction
        await connection.execute(
            'INSERT INTO transactions (compte_source_id, compte_destinataire_id, type_transaction, montant, libelle) VALUES (?, ?, "virement emis", ?, ?)',
            [sourceAcc.id, destAcc.id, montant, description || 'Virement']
        );

        await connection.commit();
        res.status(200).json({ message: 'Virement effectué avec succès.' });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(400).json({ message: error.message || 'Erreur lors du virement' });
    } finally {
        connection.release();
    }
};

// @desc    Ajouter des fonds extérieurs (Dépôt)
// @route   POST /api/transactions/deposit
// @access  Private
const depositFunds = async (req, res) => {
    const { accountId, montant } = req.body;

    if (!accountId || !montant || montant <= 0) {
        return res.status(400).json({ message: 'Données de dépôt invalides.' });
    }

    try {
        const [accounts] = await pool.execute(
            'SELECT id FROM comptes_bancaires WHERE id = ? AND utilisateur_id = ?',
            [accountId, req.user.id]
        );

        if (accounts.length === 0) {
            return res.status(404).json({ message: 'Compte introuvable ou non autorisé.' });
        }

        await pool.execute(
            'UPDATE comptes_bancaires SET solde = solde + ? WHERE id = ?',
            [montant, accountId]
        );

        await pool.execute(
            'INSERT INTO transactions (compte_destinataire_id, type_transaction, montant, libelle) VALUES (?, "depot", ?, "Dépôt initial / externe")',
            [accountId, montant]
        );

        res.status(200).json({ message: 'Fonds ajoutés avec succès.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du dépôt.' });
    }
};

// @desc    Historique des transactions
// @route   GET /api/transactions/:accountId
// @access  Private
const getTransactions = async (req, res) => {
    const accountId = req.params.accountId;

    try {
        // Vérif autorisation (est-ce bien le compte de l'utilisateur)
        const [accounts] = await pool.execute(
            'SELECT id FROM comptes_bancaires WHERE id = ? AND utilisateur_id = ?',
            [accountId, req.user.id]
        );

        if (accounts.length === 0) return res.status(404).json({ message: 'Compte non autorisé.' });

        // Historique
        const [transactions] = await pool.execute(
            `SELECT t.*, 
            c_dest.numero_compte AS dest_iban, c_dest.type_compte AS dest_type,
            c_source.numero_compte AS source_iban, c_source.type_compte AS source_type
            FROM transactions t
            LEFT JOIN comptes_bancaires c_dest ON t.compte_destinataire_id = c_dest.id
            LEFT JOIN comptes_bancaires c_source ON t.compte_source_id = c_source.id
            WHERE t.compte_source_id = ? OR t.compte_destinataire_id = ?
            ORDER BY t.date_transaction DESC
            LIMIT 20`,
            [accountId, accountId]
        );

        res.json(transactions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur de récupération.' });
    }
};

module.exports = { createTransfer, depositFunds, getTransactions };
