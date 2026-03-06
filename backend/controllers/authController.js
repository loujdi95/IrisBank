const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Fonction utilitaire pour générer le token JWT
const generateToken = (id, est_admin) => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign({ id, est_admin }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Créer un compte client (Inscription)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { email, password, telephone, adresse_postale, date_naissance } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Veuillez renseigner tous les champs obligatoires' });
    }

    // RG "Mot de passe" : Minimum 8 caractères, 1 majuscule, 1 chiffre
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({
            message: 'Le mot de passe doit contenir au moins 8 caractères, dont 1 majuscule et 1 chiffre.'
        });
    }

    try {
        // Vérifier si l'utilisateur existe déjà
        const [existingUsers] = await pool.execute('SELECT * FROM utilisateurs WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ message: 'Cet email est déjà utilisé' });
        }

        // Hashage du mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Insertion
        const [result] = await pool.execute(
            'INSERT INTO utilisateurs (email, mot_de_passe, telephone, adresse_postale, date_naissance, est_admin) VALUES (?, ?, ?, ?, ?, ?)',
            [email, hashedPassword, telephone || null, adresse_postale || null, date_naissance || null, false]
        );

        const newUser = {
            id: result.insertId,
            email,
            est_admin: false
        };

        res.status(201).json({
            message: 'Inscription réussie',
            user: newUser,
            token: generateToken(result.insertId, false)
        });
    } catch (error) {
        console.error('Erreur lors de l\'inscription :', error);
        res.status(500).json({ message: 'Erreur serveur lors de l\'inscription', error: error.message });
    }
};

// @desc    Authentification (Connexion)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Tous les champs sont requis' });
    }

    try {
        const [users] = await pool.execute('SELECT * FROM utilisateurs WHERE email = ?', [email]);

        if (users.length === 0) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        const user = users[0];

        // Comparaison DB / Entrée utilisateur
        const match = await bcrypt.compare(password, user.mot_de_passe);

        if (match) {
            res.json({
                message: 'Connexion réussie',
                user: {
                    id: user.id,
                    email: user.email,
                    est_admin: user.est_admin
                },
                token: generateToken(user.id, user.est_admin)
            });
        } else {
            res.status(401).json({ message: 'Identifiants invalides' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
    }
};

module.exports = { registerUser, loginUser };
