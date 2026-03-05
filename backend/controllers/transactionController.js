const pool = require('../config/db');

// @desc    Effectuer un dépôt sur un compte
// @route   POST /api/transactions/deposit
// @access  Private
const deposit = async (req, res) => {
    const { compte_id, montant } = req.body;
    const montantFloat = parseFloat(montant);

    if (montantFloat < 1) {
        return res.status(400).json({ message: 'Le montant minimum pour un dépôt est de 1€' });
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // 1. Vérifier le compte
        const [comptes] = await conn.execute(
            'SELECT solde, statut_compte FROM comptes_bancaires WHERE id = ? AND utilisateur_id = ? FOR UPDATE',
            [compte_id, req.user.id]
        );

        if (comptes.length === 0) return res.status(404).json({ message: 'Compte introuvable' });
        if (comptes[0].statut_compte === 'bloque') return res.status(403).json({ message: 'Compte bloqué. Transaction impossible.' });

        // 2. Mettre à jour le solde
        const nouveauSolde = parseFloat(comptes[0].solde) + montantFloat;
        await conn.execute('UPDATE comptes_bancaires SET solde = ? WHERE id = ?', [nouveauSolde, compte_id]);

        // 3. Enregistrer la transaction
        await conn.execute(
            'INSERT INTO transactions (compte_destinataire_id, type_transaction, montant, libelle) VALUES (?, ?, ?, ?)',
            [compte_id, 'depot', montantFloat, 'Dépôt via espace client']
        );

        await conn.commit();
        res.json({ message: 'Dépôt effectué avec succès', nouveau_solde: nouveauSolde });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du dépôt' });
    } finally {
        conn.release();
    }
};

// @desc    Effectuer un retrait sur un compte
// @route   POST /api/transactions/withdraw
// @access  Private
const withdraw = async (req, res) => {
    const { compte_id, montant } = req.body;
    const montantFloat = parseFloat(montant);

    if (montantFloat < 1) return res.status(400).json({ message: 'Le montant minimum est de 1€' });
    if (montantFloat > 1000) return res.status(400).json({ message: 'Le retrait maximum autorisé est de 1000€' });

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [comptes] = await conn.execute(
            'SELECT solde, statut_compte FROM comptes_bancaires WHERE id = ? AND utilisateur_id = ? FOR UPDATE',
            [compte_id, req.user.id]
        );

        if (comptes.length === 0) return res.status(404).json({ message: 'Compte introuvable' });
        if (comptes[0].statut_compte === 'bloque') return res.status(403).json({ message: 'Compte bloqué.' });

        const nouveauSolde = parseFloat(comptes[0].solde) - montantFloat;
        if (nouveauSolde < 0) return res.status(400).json({ message: 'Solde insuffisant pour ce retrait. Le solde ne peut pas être négatif.' });

        await conn.execute('UPDATE comptes_bancaires SET solde = ? WHERE id = ?', [nouveauSolde, compte_id]);

        await conn.execute(
            'INSERT INTO transactions (compte_source_id, type_transaction, montant, libelle) VALUES (?, ?, ?, ?)',
            [compte_id, 'retrait', montantFloat, 'Retrait via espace client']
        );

        await conn.commit();
        res.json({ message: 'Retrait effectué avec succès', nouveau_solde: nouveauSolde });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du retrait' });
    } finally {
        conn.release();
    }
};

// @desc    Effectuer un virement
// @route   POST /api/transactions/transfer
// @access  Private
const transfer = async (req, res) => {
    const { compte_source_id, compte_destinataire_id, montant, libelle } = req.body;
    const montantFloat = parseFloat(montant);

    if (montantFloat < 1) return res.status(400).json({ message: 'Montant minimum 1€' });
    if (compte_source_id === compte_destinataire_id) return res.status(400).json({ message: 'Virement vers le même compte impossible' });

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        // Vérification du compte source (lui appartient et non bloqué)
        const [sourceAccounts] = await conn.execute(
            'SELECT solde, statut_compte FROM comptes_bancaires WHERE id = ? AND utilisateur_id = ? FOR UPDATE',
            [compte_source_id, req.user.id]
        );

        if (sourceAccounts.length === 0) return res.status(404).json({ message: 'Compte source introuvable' });
        if (sourceAccounts[0].statut_compte === 'bloque') return res.status(403).json({ message: 'Compte source bloqué' });

        const sourceSoldeTotal = parseFloat(sourceAccounts[0].solde);
        if (sourceSoldeTotal - montantFloat < 0) return res.status(400).json({ message: 'Solde source insuffisant' });

        // Vérification du compte de destination (juste exister et non bloqué)
        const [destAccounts] = await conn.execute(
            'SELECT solde, statut_compte FROM comptes_bancaires WHERE id = ? FOR UPDATE',
            [compte_destinataire_id]
        );

        if (destAccounts.length === 0) return res.status(404).json({ message: 'Compte destinataire invalide' });
        if (destAccounts[0].statut_compte === 'bloque') return res.status(403).json({ message: 'Compte destinataire bloqué' });

        // Exécuter le transfert
        await conn.execute('UPDATE comptes_bancaires SET solde = solde - ? WHERE id = ?', [montantFloat, compte_source_id]);
        await conn.execute('UPDATE comptes_bancaires SET solde = solde + ? WHERE id = ?', [montantFloat, compte_destinataire_id]);

        // Enregistrement des transactions
        await conn.execute(
            'INSERT INTO transactions (compte_source_id, compte_destinataire_id, type_transaction, montant, libelle) VALUES (?, ?, ?, ?, ?)',
            [compte_source_id, compte_destinataire_id, 'virement emis', montantFloat, libelle || 'Virement émis']
        );
        await conn.execute(
            'INSERT INTO transactions (compte_source_id, compte_destinataire_id, type_transaction, montant, libelle) VALUES (?, ?, ?, ?, ?)',
            [compte_source_id, compte_destinataire_id, 'virement recu', montantFloat, libelle || 'Virement reçu']
        );

        await conn.commit();
        res.json({ message: 'Virement effectué avec succès' });
    } catch (error) {
        await conn.rollback();
        console.error(error);
        res.status(500).json({ message: 'Erreur lors du virement' });
    } finally {
        conn.release();
    }
};

module.exports = { deposit, withdraw, transfer };
