const express = require('express');
const pool = require('../db');

const router = express.Router();

router.post('/', async (req, res, next) => {
    try {
        const { name, email, subject, message } = req.body;

        if(!name || !email || !message){
            return res.status(400).json({ error: 'Nom, email et message sont requis.' });
        }

        const result = await pool.query(
            `INSERT INTO contact_messages (name, email, subject, message)
             VALUES ($1, $2, $3, $4)
             RETURNING id, created_at`,
            [name.trim(), email.trim().toLowerCase(), subject ? subject.trim() : null, message.trim()]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
