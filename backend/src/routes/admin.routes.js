const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { saveImage, UploadError } = require('../uploads');

// Back-office : gestion des produits, commandes, utilisateurs et du compte admin.
// Toutes les routes exigent un administrateur.
const router = express.Router();
router.use(requireAuth, requireAdmin);

const CATEGORIES = ['Maillots', 'Avant-match', 'Entraînement', 'Voyage', 'Ligue des Champions'];
const ORDER_STATUSES = ['payé', 'impayé', 'annulé'];
const PAGE_SIZE = 50;

const toInt = (value) => Number(value) || 0;
const escapeLike = (text) => text.replace(/[\\%_]/g, (c) => '\\' + c);

const badRequest = (res, message) => res.status(400).json({ error: message });

/* ##################### */
/* Produits */
/* ##################### */

// Valide et normalise les champs d'un produit ; renvoie { error } ou { product }.
const parseProduct = async (body) => {
    const text = (value, max) => {
        const v = (value ?? '').toString().trim();
        return v.length === 0 ? null : v.slice(0, max);
    };

    const name = text(body.name, 200);
    if(!name) return { error: 'Le nom du produit est obligatoire.' };

    const price = Number(body.price);
    if(!Number.isInteger(price) || price < 0 || price > 10000000){
        return { error: 'Le prix doit être un nombre entier en ariary (0 à 10 000 000).' };
    }

    const category = text(body.category, 30) || 'Maillots';
    if(!CATEGORIES.includes(category)){
        return { error: `Catégorie inconnue (${CATEGORIES.join(', ')}).` };
    }

    // Seules les images du site sont acceptées (pas d'URL externe).
    const imageUrl = text(body.image_url, 300) || '/Images/maillot-placeholder.svg';
    if(!imageUrl.startsWith('/Images/') || imageUrl.includes('..')){
        return { error: "L'image doit être un fichier du dossier /Images du site." };
    }

    let teamId = null;
    if(body.team_id !== undefined && body.team_id !== null && body.team_id !== ''){
        teamId = Number(body.team_id);
        const team = await pool.query('SELECT id FROM teams WHERE id = $1', [teamId]);
        if(team.rows.length === 0) return { error: 'Équipe introuvable.' };
    }

    const season = text(body.season, 20);
    let seasonStartYear = body.season_start_year ? Number(body.season_start_year) : null;
    if(!seasonStartYear && season){
        const match = season.match(/^(\d{4})/);
        if(match) seasonStartYear = Number(match[1]);
    }
    if(seasonStartYear !== null && (!Number.isInteger(seasonStartYear) || seasonStartYear < 1850 || seasonStartYear > 2100)){
        return { error: 'Année de saison invalide.' };
    }

    return {
        product: {
            name,
            price,
            image_url: imageUrl,
            team_id: teamId,
            category,
            season,
            season_start_year: seasonStartYear,
            type: text(body.type, 60),
            design: text(body.design, 50),
            colors: text(body.colors, 100),
            brand: text(body.brand, 50),
            sizes: text(body.sizes, 100)
        }
    };
};

const PRODUCT_FIELDS = ['name', 'price', 'image_url', 'team_id', 'category', 'season', 'season_start_year', 'type', 'design', 'colors', 'brand', 'sizes'];

router.get('/products', async (req, res, next) => {
    try {
        const q = (req.query.q || '').trim();
        const category = req.query.category || '';
        const page = Math.max(1, toInt(req.query.page) || 1);
        const like = q ? `%${escapeLike(q)}%` : '';

        const where = `WHERE ($1 = '' OR p.name ILIKE $1 OR t.name ILIKE $1 OR p.type ILIKE $1)
                         AND ($2 = '' OR p.category = $2)`;

        const total = await pool.query(
            `SELECT COUNT(*) FROM products p LEFT JOIN teams t ON t.id = p.team_id ${where}`,
            [like, category]
        );
        const rows = await pool.query(
            `SELECT p.id, p.name, p.price, p.image_url, p.category, p.type, p.season, p.season_start_year,
                    p.design, p.colors, p.brand, p.sizes, p.team_id, t.name AS team_name, l.name AS league_name
             FROM products p
             LEFT JOIN teams t ON t.id = p.team_id
             LEFT JOIN leagues l ON l.id = t.league_id
             ${where}
             ORDER BY p.id DESC
             LIMIT ${PAGE_SIZE} OFFSET $3`,
            [like, category, (page - 1) * PAGE_SIZE]
        );

        res.json({ total: toInt(total.rows[0].count), page, page_size: PAGE_SIZE, products: rows.rows });
    } catch (err) {
        next(err);
    }
});

router.post('/products', async (req, res, next) => {
    try {
        const { error, product } = await parseProduct(req.body);
        if(error) return badRequest(res, error);

        const values = PRODUCT_FIELDS.map(f => product[f]);
        const result = await pool.query(
            `INSERT INTO products (${PRODUCT_FIELDS.join(', ')})
             VALUES (${PRODUCT_FIELDS.map((_, i) => '$' + (i + 1)).join(', ')})
             RETURNING *`,
            values
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.put('/products/:id', async (req, res, next) => {
    try {
        const { error, product } = await parseProduct(req.body);
        if(error) return badRequest(res, error);

        const values = PRODUCT_FIELDS.map(f => product[f]);
        const result = await pool.query(
            `UPDATE products SET ${PRODUCT_FIELDS.map((f, i) => `${f} = $${i + 1}`).join(', ')}
             WHERE id = $${PRODUCT_FIELDS.length + 1}
             RETURNING *`,
            [...values, req.params.id]
        );
        if(result.rows.length === 0){
            return res.status(404).json({ error: 'Produit introuvable.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// Les commandes passées gardent le nom et le prix du produit supprimé.
router.delete('/products/:id', async (req, res, next) => {
    try {
        const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id, name', [req.params.id]);
        if(result.rows.length === 0){
            return res.status(404).json({ error: 'Produit introuvable.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.get('/teams', async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT t.id, t.name, l.name AS league_name
             FROM teams t JOIN leagues l ON l.id = t.league_id
             ORDER BY l.name, t.name`
        );
        res.json(result.rows);
    } catch (err) {
        next(err);
    }
});

// Envoi d'une photo encodée en base64 ; enregistrée dans Images/Uploads.
router.post('/uploads', async (req, res, next) => {
    try {
        res.status(201).json({ image_url: saveImage(req.body.data, req.body.filename, 'Uploads') });
    } catch (err) {
        if(err instanceof UploadError) return badRequest(res, err.message);
        next(err);
    }
});

/* ##################### */
/* Commandes */
/* ##################### */

router.get('/orders', async (req, res, next) => {
    try {
        const status = req.query.status || '';
        if(status && !ORDER_STATUSES.includes(status)) return badRequest(res, 'Statut inconnu.');

        const orders = await pool.query(
            `SELECT o.id, o.status, o.total, o.created_at, o.address, o.phone, o.payment_method,
                    u.name AS customer, u.email AS customer_email
             FROM orders o
             JOIN users u ON u.id = o.user_id
             WHERE ($1 = '' OR o.status = $1)
             ORDER BY o.created_at DESC
             LIMIT 200`,
            [status]
        );

        const ids = orders.rows.map(o => o.id);
        const items = ids.length === 0 ? [] : (await pool.query(
            `SELECT order_id, product_id, name, price, qty FROM order_items WHERE order_id = ANY($1) ORDER BY id`,
            [ids]
        )).rows;

        res.json(orders.rows.map(order => ({
            ...order,
            items: items.filter(i => i.order_id === order.id)
        })));
    } catch (err) {
        next(err);
    }
});

router.patch('/orders/:id', async (req, res, next) => {
    try {
        const { status } = req.body;
        if(!ORDER_STATUSES.includes(status)) return badRequest(res, `Statut invalide (${ORDER_STATUSES.join(', ')}).`);

        const result = await pool.query(
            'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, status',
            [status, req.params.id]
        );
        if(result.rows.length === 0){
            return res.status(404).json({ error: 'Commande introuvable.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

/* ##################### */
/* Utilisateurs */
/* ##################### */

router.get('/users', async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT u.id, u.name, u.email, u.is_admin, u.created_at,
                    COUNT(o.id) AS orders,
                    COALESCE(SUM(o.total) FILTER (WHERE o.status = 'payé'), 0) AS spent
             FROM users u
             LEFT JOIN orders o ON o.user_id = u.id
             GROUP BY u.id
             ORDER BY u.is_admin DESC, u.created_at DESC`
        );
        res.json(result.rows.map(u => ({ ...u, orders: toInt(u.orders), spent: toInt(u.spent), is_self: u.id === req.userId })));
    } catch (err) {
        next(err);
    }
});

router.patch('/users/:id', async (req, res, next) => {
    try {
        const userId = Number(req.params.id);
        if(typeof req.body.is_admin !== 'boolean') return badRequest(res, 'Valeur is_admin manquante.');
        // Empêche l'admin connecté de se retirer ses propres droits par erreur.
        if(userId === req.userId && !req.body.is_admin){
            return badRequest(res, 'Vous ne pouvez pas retirer vos propres droits administrateur.');
        }

        const result = await pool.query(
            'UPDATE users SET is_admin = $1 WHERE id = $2 RETURNING id, name, is_admin',
            [req.body.is_admin, userId]
        );
        if(result.rows.length === 0){
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// Supprimer un compte supprimerait aussi ses commandes (ON DELETE CASCADE) :
// c'est refusé tant que le compte a des commandes, pour garder l'historique des ventes.
router.delete('/users/:id', async (req, res, next) => {
    try {
        const userId = Number(req.params.id);
        if(userId === req.userId) return badRequest(res, 'Vous ne pouvez pas supprimer votre propre compte.');

        const orders = await pool.query('SELECT COUNT(*) FROM orders WHERE user_id = $1', [userId]);
        if(toInt(orders.rows[0].count) > 0){
            return res.status(409).json({ error: 'Ce compte a des commandes : il ne peut pas être supprimé sans perdre l\'historique des ventes.' });
        }

        const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, name', [userId]);
        if(result.rows.length === 0){
            return res.status(404).json({ error: 'Utilisateur introuvable.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

/* ##################### */
/* Mon compte */
/* ##################### */

router.put('/me', async (req, res, next) => {
    try {
        const name = (req.body.name || '').trim();
        const email = (req.body.email || '').trim().toLowerCase();
        if(!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
            return badRequest(res, 'Nom et email valide requis.');
        }

        const taken = await pool.query('SELECT id FROM users WHERE email = $1 AND id <> $2', [email, req.userId]);
        if(taken.rows.length > 0){
            return res.status(409).json({ error: 'Cet email est déjà utilisé par un autre compte.' });
        }

        const result = await pool.query(
            'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, is_admin',
            [name.slice(0, 120), email.slice(0, 160), req.userId]
        );
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

router.put('/me/password', async (req, res, next) => {
    try {
        const { current, next: newPassword } = req.body;
        if(!current || !newPassword) return badRequest(res, 'Mot de passe actuel et nouveau mot de passe requis.');
        if(newPassword.length < 8) return badRequest(res, 'Le nouveau mot de passe doit faire au moins 8 caractères.');

        const user = (await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.userId])).rows[0];
        if(!(await bcrypt.compare(current, user.password_hash))){
            // 400 et non 401 : un 401 ferait croire à une session expirée côté admin.
            return badRequest(res, 'Mot de passe actuel incorrect.');
        }

        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [await bcrypt.hash(newPassword, 10), req.userId]);
        res.json({ ok: true });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
