const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        try {
            // Récupère le token du header (Bearer <token>)
            token = req.headers.authorization.split(' ')[1];

            // Vérifie et décrypte le token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Ajoute les infos de l'utilisateur à la requête (sans le mot de passe)
            req.user = decoded;
            next();
        } catch (error) {
            console.error(error);
            res.status(401).json({ message: 'Non autorisé, token invalide' });
        }
    }

    if (!token) {
        res.status(401).json({ message: 'Non autorisé, pas de token' });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.est_admin) {
        next();
    } else {
        res.status(403).json({ message: 'Non autorisé en tant qu\'administrateur' });
    }
};

module.exports = { protect, admin };
