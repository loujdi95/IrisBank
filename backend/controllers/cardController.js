const db = require('../config/db');

// @desc    Get all cards for the current user
// @route   GET /api/cards
// @access  Private
exports.getCards = async (req, res) => {
    try {
        const userId = req.user.id;
        const [cards] = await db.query(`
            SELECT c.*, cb.numero_compte, cb.type_compte 
            FROM cartes c
            JOIN comptes_bancaires cb ON c.compte_id = cb.id
            WHERE c.utilisateur_id = ?
        `, [userId]);

        res.json(cards);
    } catch (error) {
        console.error('getCards Error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des cartes' });
    }
};

// @desc    Get single card details
// @route   GET /api/cards/:id
// @access  Private
exports.getCardDetails = async (req, res) => {
    try {
        const userId = req.user.id;
        const cardId = req.params.id;

        const [details] = await db.query(`
            SELECT c.*, cb.numero_compte, cb.type_compte, u.prenom, u.nom
            FROM cartes c
            JOIN comptes_bancaires cb ON c.compte_id = cb.id
            JOIN utilisateurs u ON c.utilisateur_id = u.id
            WHERE c.id = ? AND c.utilisateur_id = ?
        `, [cardId, userId]);

        if (details.length === 0) {
            return res.status(404).json({ message: 'Carte non trouvée' });
        }

        res.json(details[0]);
    } catch (error) {
        console.error('getCardDetails Error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du détail' });
    }
};

// @desc    Toggle card lock status
// @route   PATCH /api/cards/:id/toggle
// @access  Private
exports.toggleCardStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        const cardId = req.params.id;

        const [cards] = await db.query('SELECT statut FROM cartes WHERE id = ? AND utilisateur_id = ?', [cardId, userId]);
        if (cards.length === 0) return res.status(404).json({ message: 'Carte non trouvée' });

        const currentStatut = cards[0].statut;
        if (currentStatut === 'opposition') {
            return res.status(400).json({ message: 'Une carte en opposition ne peut pas être débloquée' });
        }

        const newStatut = currentStatut === 'actif' ? 'bloque' : 'actif';
        await db.query('UPDATE cartes SET statut = ? WHERE id = ?', [newStatut, cardId]);

        res.json({ message: `Carte ${newStatut === 'actif' ? 'débloquée' : 'bloquée'} avec succès`, statut: newStatut });
    } catch (error) {
        console.error('toggleCardStatus Error:', error);
        res.status(500).json({ message: 'Erreur lors du changement de statut' });
    }
};

// @desc    Report opposition (permanent loss/theft)
// @route   PATCH /api/cards/:id/opposition
// @access  Private
exports.reportOpposition = async (req, res) => {
    try {
        const userId = req.user.id;
        const cardId = req.params.id;

        await db.query('UPDATE cartes SET statut = "opposition" WHERE id = ? AND utilisateur_id = ?', [cardId, userId]);
        res.json({ message: 'Opposition enregistrée avec succès. La carte est définitivement désactivée.', statut: 'opposition' });
    } catch (error) {
        console.error('reportOpposition Error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise en opposition' });
    }
};

// @desc    Update card limits
// @route   PATCH /api/cards/:id/limits
// @access  Private
exports.updateLimits = async (req, res) => {
    try {
        const userId = req.user.id;
        const cardId = req.params.id;
        const { limit_pay, limit_atm } = req.body;

        await db.query(
            'UPDATE cartes SET plafond_paiement = ?, plafond_retrait = ? WHERE id = ? AND utilisateur_id = ?',
            [limit_pay, limit_atm, cardId, userId]
        );

        res.json({ message: 'Plafonds mis à jour avec succès' });
    } catch (error) {
        console.error('updateLimits Error:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour des plafonds' });
    }
};
