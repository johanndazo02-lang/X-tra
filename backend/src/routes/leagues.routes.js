const express = require('express');
const pool = require('../db');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT id, name, logo_url FROM leagues ORDER BY name');
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

router.get('/:id/teams', async (req, res, next) => {
    try {
        const leagueResult = await pool.query('SELECT id, name, logo_url FROM leagues WHERE id = $1', [req.params.id]);
        if(leagueResult.rows.length === 0){
            return res.status(404).json({ error: 'Championnat introuvable.' });
        }

        const teamsResult = await pool.query(
            'SELECT id, name, crest_url FROM teams WHERE league_id = $1 ORDER BY name',
            [req.params.id]
        );

        res.json({ league: leagueResult.rows[0], teams: teamsResult.rows });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
