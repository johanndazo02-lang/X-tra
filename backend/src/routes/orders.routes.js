const express = require('express');
const pool = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/', requireAuth, async (req, res, next) => {
    const { items, paid, address, phone, paymentMethod } = req.body;

    if(!Array.isArray(items) || items.length === 0){
        return res.status(400).json({ error: 'Le panier est vide.' });
    }
    if(!address || !phone){
        return res.status(400).json({ error: "L'adresse de livraison et le téléphone sont requis." });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Les prix ne sont jamais pris depuis la requête client : on les revérifie
        // toujours contre la base pour empêcher toute falsification de prix.
        const ids = items.map(item => item.id).filter(Boolean);
        const priceRows = ids.length > 0
            ? (await client.query('SELECT id, name, price FROM products WHERE id = ANY($1)', [ids])).rows
            : [];
        const productById = new Map(priceRows.map(p => [p.id, p]));

        const resolvedItems = items.map(item => {
            const product = productById.get(Number(item.id));
            return {
                id: item.id || null,
                name: product ? product.name : item.name,
                price: product ? product.price : item.price,
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
