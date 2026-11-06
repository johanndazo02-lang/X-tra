const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/:id', async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT t.id, t.name, t.crest_url, t.founded_year, t.history, t.suppliers, t.sponsors, l.id AS league_id, l.name AS league_name
             FROM teams t
             JOIN leagues l ON l.id = t.league_id
             WHERE t.id = $1`,
            [req.params.id]
        );
        if(result.rows.length === 0){
            return res.status(404).json({ error: 'Équipe introuvable.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.get('/:id/jerseys', async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT id, name, price, image_url, season, type, season_start_year, category
             FROM products
             WHERE team_id = $1
             ORDER BY
                CASE category WHEN 'Maillots' THEN 0 ELSE 1 END,
                category,
                season_start_year DESC NULLS LAST,
                type`,
            [req.params.id]
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
