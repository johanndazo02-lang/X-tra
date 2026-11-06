const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');
const { saveImage, removeImage, UploadError } = require('../uploads');

const router = express.Router();

const signToken = (userId) => jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
const toPublicUser = (user) => ({ id: user.id, name: user.name, email: user.email, is_admin: user.is_admin, avatar_url: user.avatar_url || null });

router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        if(!name || !email || !password || password.length < 6){
            return res.status(400).json({ error: 'Nom, email et mot de passe (6 caractères min.) requis.' });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);
        if(existing.rows.length > 0){
            return res.status(409).json({ error: 'Un compte existe déjà avec cet email.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, name, email, is_admin, avatar_url',
            [name.trim(), normalizedEmail, passwordHash]
        );

        const user = result.rows[0];
        res.status(201).json({ token: signToken(user.id), user: toPublicUser(user) });
    } catch (err) {
        next(err);
    }
});

router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if(!email || !password){
            return res.status(400).json({ error: 'Email et mot de passe requis.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [normalizedEmail]);
        const user = result.rows[0];

        if(!user || !(await bcrypt.compare(password, user.password_hash))){
            return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
        }

        res.json({ token: signToken(user.id), user: toPublicUser(user) });
    } catch (err) {
        next(err);
    }
});

/* ##################### */
/* Profil du client connecté */
/* ##################### */

const AVATAR_FOLDER = 'Avatars';

router.get('/me', requireAuth, async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, name, email, is_admin, avatar_url FROM users WHERE id = $1', [req.userId]);
        if(result.rows.length === 0){
            return res.status(404).json({ error: 'Compte introuvable.' });
        }
        res.json(toPublicUser(result.rows[0]));
    } catch (err) {
        next(err);
    }
});

// Remplace la photo de profil ; l'ancienne est supprimée du disque.
router.post('/me/avatar', requireAuth, async (req, res, next) => {
    try {
        const url = saveImage(req.body.data, req.body.filename || 'avatar', AVATAR_FOLDER);
        const previous = await pool.query('SELECT avatar_url FROM users WHERE id = $1', [req.userId]);
        const result = await pool.query(
            'UPDATE users SET avatar_url = $1 WHERE id = $2 RETURNING id, name, email, is_admin, avatar_url',
            [url, req.userId]
        );
        removeImage(previous.rows[0] && previous.rows[0].avatar_url, AVATAR_FOLDER);
        res.json(toPublicUser(result.rows[0]));
    } catch (err) {
        if(err instanceof UploadError) return res.status(400).json({ error: err.message });
        next(err);
    }
});

router.delete('/me/avatar', requireAuth, async (req, res, next) => {
    try {
        const previous = await pool.query('SELECT avatar_url FROM users WHERE id = $1', [req.userId]);
        const result = await pool.query(
            'UPDATE users SET avatar_url = NULL WHERE id = $1 RETURNING id, name, email, is_admin, avatar_url',
            [req.userId]
        );
        removeImage(previous.rows[0] && previous.rows[0].avatar_url, AVATAR_FOLDER);
        res.json(toPublicUser(result.rows[0]));
    } catch (err) {
        next(err);
    }
});

module.exports = router;
