const jwt = require('jsonwebtoken');
const pool = require('../db');

const requireAuth = (req, res, next) => {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if(!token){
        return res.status(401).json({ error: 'Authentification requise.' });
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = payload.userId;
        next();
    } catch {
        return res.status(401).json({ error: 'Session invalide ou expirée.' });
    }
};

// À placer après requireAuth. Le rôle est relu en base à chaque requête :
// retirer les droits d'un admin prend effet sans attendre l'expiration du token.
const requireAdmin = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT is_admin FROM users WHERE id = $1', [req.userId]);
        if(!result.rows[0] || !result.rows[0].is_admin){
            return res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
        }
        next();
    } catch (err) {
        next(err);
    }
};

module.exports = { requireAuth, requireAdmin };
