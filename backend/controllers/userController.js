const db = require('../config/db');

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { telephone, adresse_postale } = req.body;

        await db.query(
            'UPDATE utilisateurs SET telephone = ?, adresse_postale = ? WHERE id = ?',
            [telephone, adresse_postale, userId]
        );

        // Fetch the updated user
        const [users] = await db.query('SELECT id, nom, prenom, email, est_admin, telephone, adresse_postale, date_naissance FROM utilisateurs WHERE id = ?', [userId]);

        res.json({ message: 'Profil mis à jour avec succès', user: users[0] });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du profil:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du profil', error: error.message });
    }
};
