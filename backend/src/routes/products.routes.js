const express = require('express');
const pool = require('../db');

const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, name, price, image_url, league FROM products ORDER BY id');
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

// Doit rester avant /:id pour ne pas être capturée par cette route.
router.get('/search', async (req, res, next) => {
    try {
        const q = (req.query.q || '').trim();
        if(q.length === 0){
            return res.json([]);
        }

        const result = await pool.query(
            `SELECT p.id, p.name, p.price, p.image_url, p.season, p.type, p.category,
                    t.name AS team_name, l.name AS league_name
             FROM products p
             LEFT JOIN teams t ON t.id = p.team_id
             LEFT JOIN leagues l ON l.id = t.league_id
             WHERE p.type != 'Archive historique'
               AND (
                    p.name ILIKE $1
                    OR t.name ILIKE $1
                    OR l.name ILIKE $1
                    OR p.type ILIKE $1
                    OR p.category ILIKE $1
               )
             ORDER BY t.name, p.season_start_year DESC NULLS LAST
             LIMIT 100`,
            [`%${q}%`]
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

// Suggestions pour l'espace client de l'accueil : d'abord d'autres maillots (avec photo)
// des clubs déjà achetés, complétés par des maillots récents. Doit rester avant /:id.
router.get('/recommendations', requireAuth, async (req, res, next) => {
    try {
        const result = await pool.query(
            `WITH bought AS (
                SELECT DISTINCT oi.product_id, p.team_id
                FROM orders o
                JOIN order_items oi ON oi.order_id = o.id
                LEFT JOIN products p ON p.id = oi.product_id
                WHERE o.user_id = $1 AND o.status <> 'annulé'
             )
             SELECT p.id, p.name, p.price, p.image_url, t.name AS team_name,
                    COALESCE(p.team_id IN (SELECT team_id FROM bought WHERE team_id IS NOT NULL), false) AS same_team
             FROM products p
             LEFT JOIN teams t ON t.id = p.team_id
             WHERE p.category = 'Maillots'
               AND p.image_url NOT LIKE '%placeholder%'
               AND p.id NOT IN (SELECT product_id FROM bought WHERE product_id IS NOT NULL)
             ORDER BY same_team DESC, p.season_start_year DESC NULLS LAST, random()
             LIMIT 4`,
            [req.userId]
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.get('/:id', async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT p.id, p.name, p.price, p.image_url, p.season, p.type, p.category,
                    p.design, p.colors, p.brand, p.sizes, p.players,
                    t.id AS team_id, t.name AS team_name, t.crest_url AS team_crest,
                    l.name AS league_name, l.logo_url AS league_logo
             FROM products p
             LEFT JOIN teams t ON t.id = p.team_id
             LEFT JOIN leagues l ON l.id = t.league_id
             WHERE p.id = $1`,
            [req.params.id]
        );
        if(result.rows.length === 0){
            return res.status(404).json({ error: 'Produit introuvable.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
