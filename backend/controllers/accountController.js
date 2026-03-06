const pool = require('../config/db');

// Fonction pour générer un IBAN aléatoire (Format : FR76-YBNK-XXXX-XXXX-XXXX-XXX)
const generateIBAN = () => {
    const randomStr = (length) => {
        let result = '';
        const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        return result;
    };
    return `FR76-YBNK-${randomStr(4)}-${randomStr(4)}-${randomStr(4)}-${randomStr(3)}`;
};

// @desc    Créer un compte bancaire
// @route   POST /api/accounts
// @access  Private
const createAccount = async (req, res) => {
    const { type_compte, type_carte } = req.body;
    const validTypes = ['courant', 'livret A', 'PEL'];

    if (type_compte && !validTypes.includes(type_compte)) {
        return res.status(400).json({ message: 'Type de compte invalide' });
    }

    const generatedIBAN = generateIBAN();
    const initialBalance = Math.floor(Math.random() * (3000 - 500 + 1)) + 500;

    try {
        const [result] = await pool.execute(
            'INSERT INTO comptes_bancaires (utilisateur_id, numero_compte, type_compte, type_carte, solde, statut_compte) VALUES (?, ?, ?, ?, ?, ?)',
            [req.user.id, generatedIBAN, type_compte || 'courant', type_carte || null, initialBalance, 'actif']
        );

        res.status(201).json({
            message: 'Compte bancaire créé avec succès',
            compte: {
                id: result.insertId,
                numero_compte: generatedIBAN,
                type_compte: type_compte || 'courant',
                type_carte: type_carte || null,
                solde: initialBalance,
                statut_compte: 'actif'
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la création du compte' });
    }
};

// @desc    Lister les comptes de l'utilisateur connecté
// @route   GET /api/accounts
// @access  Private
const getMyAccounts = async (req, res) => {
    try {
        const [accounts] = await pool.execute(
            'SELECT * FROM comptes_bancaires WHERE utilisateur_id = ? ORDER BY date_creation DESC',
            [req.user.id]
        );
        res.json(accounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des comptes' });
    }
};

// @desc    Supprimer un compte bancaire
// @route   DELETE /api/accounts/:id
// @access  Private
const deleteAccount = async (req, res) => {
    const accountId = req.params.id;

    try {
        // Vérifier si le compte appartient à l'utilisateur et si solde = 0
        const [accounts] = await pool.execute(
            'SELECT id, solde FROM comptes_bancaires WHERE id = ? AND utilisateur_id = ?',
            [accountId, req.user.id]
        );

        if (accounts.length === 0) {
            return res.status(404).json({ message: 'Compte introuvable ou non autorisé' });
        }

        if (parseFloat(accounts[0].solde) !== 0.00) {
            return res.status(400).json({ message: 'Le compte ne peut être supprimé que si le solde est exactement de 0.00€.' });
        }

        await pool.execute('DELETE FROM comptes_bancaires WHERE id = ?', [accountId]);
        res.json({ message: 'Compte supprimé avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la suppression du compte' });
    }
};

module.exports = { createAccount, getMyAccounts, deleteAccount };
