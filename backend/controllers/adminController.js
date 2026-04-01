const pool = require('../config/db');

// @desc    Récupérer tous les utilisateurs
// @route   GET /api/admin/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
    try {
        const [users] = await pool.execute(
            'SELECT id, nom, prenom, email, telephone, adresse_postale, date_naissance, est_admin, date_creation FROM utilisateurs ORDER BY date_creation DESC'
        );
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération des utilisateurs' });
    }
};

// @desc    Récupérer tous les comptes bancaires
// @route   GET /api/admin/accounts
// @access  Private/Admin
const getAllAccounts = async (req, res) => {
    try {
        const [accounts] = await pool.execute(
            `SELECT c.*, u.email as proprietaire_email, u.nom as proprietaire_nom, u.prenom as proprietaire_prenom 
             FROM comptes_bancaires c 
             JOIN utilisateurs u ON c.utilisateur_id = u.id 
             ORDER BY c.date_creation DESC`
        );
        res.json(accounts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la récupération de tous les comptes' });
    }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
    const userId = req.params.id;

    try {
        // Empêcher l'admin de se supprimer lui-même par accident (optionnel mais recommandé)
        if (parseInt(userId) === req.user.id) {
            return res.status(400).json({ message: 'Vous ne pouvez pas supprimer votre propre compte administrateur.' });
        }

        const [result] = await pool.execute('DELETE FROM utilisateurs WHERE id = ?', [userId]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Utilisateur introuvable' });
        }

        res.json({ message: 'Utilisateur et ses comptes associés supprimés avec succès' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'utilisateur' });
    }
};

module.exports = { getAllUsers, getAllAccounts, deleteUser };
