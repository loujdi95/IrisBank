const db = require('../config/db');

// @desc    Get all messages for the current user
// @route   GET /api/messages
// @access  Private
exports.getMessages = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Fetch user's advisor ID
        const [users] = await db.query('SELECT conseiller_id FROM utilisateurs WHERE id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        
        const advisorId = users[0].conseiller_id;
        if (!advisorId) return res.json([]); // No advisor, no messages

        // 2. Fetch conversation between user and advisor
        const [messages] = await db.query(`
            SELECT m.*, 
                   e.prenom as expediteur_prenom, e.nom as expediteur_nom,
                   d.prenom as destinataire_prenom, d.nom as destinataire_nom
            FROM messages m
            JOIN utilisateurs e ON m.expediteur_id = e.id
            JOIN utilisateurs d ON m.destinataire_id = d.id
            WHERE (m.expediteur_id = ? AND m.destinataire_id = ?)
               OR (m.expediteur_id = ? AND m.destinataire_id = ?)
            ORDER BY m.date_envoi ASC
        `, [userId, advisorId, advisorId, userId]);

        res.json(messages);
    } catch (error) {
        console.error('getMessages Error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des messages' });
    }
};

// @desc    Send a message to the advisor
// @route   POST /api/messages
// @access  Private
exports.sendMessage = async (req, res) => {
    try {
        const userId = req.user.id;
        const { contenu } = req.body;

        if (!contenu) {
            return res.status(400).json({ message: 'Le contenu du message est requis' });
        }

        // 1. Fetch user's advisor ID
        const [users] = await db.query('SELECT conseiller_id FROM utilisateurs WHERE id = ?', [userId]);
        const advisorId = users[0]?.conseiller_id;

        if (!advisorId) {
            return res.status(400).json({ message: 'Vous n\'avez pas de conseiller attitré' });
        }

        // 2. Insert message
        const [result] = await db.query(
            'INSERT INTO messages (expediteur_id, destinataire_id, contenu) VALUES (?, ?, ?)',
            [userId, advisorId, contenu]
        );

        const newMessage = {
            id: result.insertId,
            expediteur_id: userId,
            destinataire_id: advisorId,
            contenu,
            date_envoi: new Date(),
            lu: false
        };

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('sendMessage Error:', error);
        res.status(500).json({ message: 'Erreur lors de l\'envoi du message' });
    }
};

// @desc    Get advisor info for the current user
// @route   GET /api/messages/advisor
// @access  Private
exports.getAdvisor = async (req, res) => {
    try {
        const userId = req.user.id;
        const [users] = await db.query(`
            SELECT c.id, c.prenom, c.nom, c.email 
            FROM utilisateurs u
            JOIN utilisateurs c ON u.conseiller_id = c.id
            WHERE u.id = ?
        `, [userId]);

        if (users.length === 0) {
            return res.status(404).json({ message: 'Conseiller non trouvé' });
        }

        res.json(users[0]);
    } catch (error) {
        console.error('getAdvisor Error:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du conseiller' });
    }
};
