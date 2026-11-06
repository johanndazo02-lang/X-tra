const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

// Quantité maximale d'un même article dans une commande
const MAX_QTY_PER_ITEM = 20;

router.post('/', requireAuth, async (req, res, next) => {
    const { items, paid, address, phone, paymentMethod } = req.body;

    if(!Array.isArray(items) || items.length === 0){
        return res.status(400).json({ error: 'Le panier est vide.' });
    }
    if(!address || !phone){
        return res.status(400).json({ error: "L'adresse de livraison et le téléphone sont requis." });
    }

    // Chaque article doit désigner un produit existant (id entier) avec une quantité
    // entière raisonnable : sans id, le serveur ne pourrait pas relire le prix en base,
    // et une quantité négative donnerait un total négatif.
    const requestedItems = items.map(item => ({ id: Number(item.id), qty: Number(item.qty) }));
    const invalidItem = requestedItems.find(item =>
        !Number.isInteger(item.id) || item.id <= 0 ||
        !Number.isInteger(item.qty) || item.qty < 1 || item.qty > MAX_QTY_PER_ITEM
    );
    if(invalidItem){
        return res.status(400).json({ error: `Article invalide dans le panier (quantité entre 1 et ${MAX_QTY_PER_ITEM}).` });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Les prix et les noms ne sont JAMAIS pris depuis la requête client : on les relit
        // toujours en base pour empêcher toute falsification de prix.
        const ids = requestedItems.map(item => item.id);
        const productRows = (await client.query(
            'SELECT id, name, price, type FROM products WHERE id = ANY($1)',
            [ids]
        )).rows;
        const productById = new Map(productRows.map(p => [p.id, p]));

        // Un produit introuvable ou une pièce d'archive (non vendue) bloque la commande.
        const unavailable = requestedItems.find(item => {
            const product = productById.get(item.id);
            return !product || product.type === 'Archive historique';
        });
        if(unavailable){
            await client.query('ROLLBACK');
            return res.status(400).json({ error: "Un article du panier n'est plus disponible. Retirez-le puis réessayez." });
        }

        const resolvedItems = requestedItems.map(item => {
            const product = productById.get(item.id);
            return {
                id: product.id,
                name: product.name,
                price: product.price,
                qty: item.qty
            };
        });

        const total = resolvedItems.reduce((sum, item) => sum + item.price * item.qty, 0);
        const status = paid ? 'payé' : 'impayé';

        const orderResult = await client.query(
            `INSERT INTO orders (user_id, status, total, address, phone, payment_method)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, status, total, created_at, address, phone, payment_method`,
            [req.userId, status, total, address, phone, paymentMethod || null]
        );
        const order = orderResult.rows[0];

        for(const item of resolvedItems){
            await client.query(
                'INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES ($1, $2, $3, $4, $5)',
                [order.id, item.id, item.name, item.price, item.qty]
            );
        }

        await client.query('COMMIT');
        res.status(201).json({ ...order, items: resolvedItems });
    } catch (err) {
        await client.query('ROLLBACK');
        next(err);
    } finally {
        client.release();
    }
});

router.get('/me', requireAuth, async (req, res, next) => {
    try {
        const ordersResult = await pool.query(
            `SELECT id, status, total, created_at, address, phone, payment_method
             FROM orders WHERE user_id = $1 ORDER BY created_at DESC`,
            [req.userId]
        );

        const orders = ordersResult.rows;
        const orderIds = orders.map(o => o.id);

        let itemsByOrder = {};
        if(orderIds.length > 0){
            const itemsResult = await pool.query(
                `SELECT oi.order_id, oi.name, oi.price, oi.qty, p.image_url
                 FROM order_items oi
                 LEFT JOIN products p ON p.id = oi.product_id
                 WHERE oi.order_id = ANY($1)`,
                [orderIds]
            );
            itemsByOrder = itemsResult.rows.reduce((acc, row) => {
                acc[row.order_id] = acc[row.order_id] || [];
                acc[row.order_id].push({ name: row.name, price: row.price, qty: row.qty, image_url: row.image_url });
                return acc;
            }, {});
        }

        res.json(orders.map(order => ({
            ...order,
            items: itemsByOrder[order.id] || []
        })));
    } catch (err) {
        next(err);
    }
});

module.exports = router;
