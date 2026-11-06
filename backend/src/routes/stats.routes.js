const express = require('express');
const pool = require('../db');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Les ventes = commandes payées. Les commandes impayées sont comptées à part
// (montant en attente) pour ne pas gonfler le chiffre d'affaires.
// Madagascar est en UTC+3 toute l'année (pas d'heure d'été).
const TZ = 'Indian/Antananarivo';
const DAY = 86400000;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const toInt = (value) => Number(value) || 0;
const startOfDay = (isoDate) => new Date(`${isoDate}T00:00:00+03:00`);
const toIsoDate = (date) => new Date(date.getTime() + 3 * 3600000).toISOString().slice(0, 10);

const summarize = async (from, to) => {
    const result = await pool.query(
        `SELECT
            COUNT(*) FILTER (WHERE status <> 'annulé') AS orders,
            COUNT(*) FILTER (WHERE status = 'payé') AS paid_orders,
            COUNT(*) FILTER (WHERE status = 'impayé') AS unpaid_orders,
            COALESCE(SUM(total) FILTER (WHERE status = 'payé'), 0) AS revenue,
            COALESCE(SUM(total) FILTER (WHERE status = 'impayé'), 0) AS pending,
            COUNT(DISTINCT user_id) FILTER (WHERE status = 'payé') AS customers
         FROM orders
         WHERE created_at >= $1 AND created_at < $2`,
        [from, to]
    );
    const items = await pool.query(
        `SELECT COALESCE(SUM(oi.qty), 0) AS items
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         WHERE o.status = 'payé' AND o.created_at >= $1 AND o.created_at < $2`,
        [from, to]
    );

    const row = result.rows[0];
    const paidOrders = toInt(row.paid_orders);
    const revenue = toInt(row.revenue);
    return {
        orders: toInt(row.orders),
        paid_orders: paidOrders,
        unpaid_orders: toInt(row.unpaid_orders),
        revenue,
        pending: toInt(row.pending),
        customers: toInt(row.customers),
        items_sold: toInt(items.rows[0].items),
        average_basket: paidOrders > 0 ? Math.round(revenue / paidOrders) : 0
    };
};

// Répartition des articles vendus selon une colonne (produit, championnat, catégorie).
const breakdown = async (labelSql, from, to, limit) => {
    const result = await pool.query(
        `SELECT ${labelSql} AS label,
                SUM(oi.qty) AS qty,
                SUM(oi.qty * oi.price) AS revenue
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         LEFT JOIN products p ON p.id = oi.product_id
         LEFT JOIN teams t ON t.id = p.team_id
         LEFT JOIN leagues l ON l.id = t.league_id
         WHERE o.status = 'payé' AND o.created_at >= $1 AND o.created_at < $2
         GROUP BY 1
         ORDER BY revenue DESC, label
         LIMIT $3`,
        [from, to, limit]
    );
    return result.rows.map(row => ({ label: row.label, qty: toInt(row.qty), revenue: toInt(row.revenue) }));
};

// GET /api/stats/sales?from=2026-09-01&to=2026-10-16 (dates incluses).
// Sans paramètre : les 30 derniers jours.
router.get('/sales', requireAuth, requireAdmin, async (req, res, next) => {
    const today = toIsoDate(new Date());
    const fromDate = req.query.from || toIsoDate(new Date(Date.now() - 29 * DAY));
    const toDate = req.query.to || today;

    if(!DATE_RE.test(fromDate) || !DATE_RE.test(toDate) || isNaN(startOfDay(fromDate)) || isNaN(startOfDay(toDate))){
        return res.status(400).json({ error: 'Dates invalides (format attendu : AAAA-MM-JJ).' });
    }
    if(fromDate > toDate){
        return res.status(400).json({ error: 'La date de début doit précéder la date de fin.' });
    }

    try {
        const from = startOfDay(fromDate);
        const to = new Date(startOfDay(toDate).getTime() + DAY);
        const span = to - from;
        const previousFrom = new Date(from.getTime() - span);

        const summary = await summarize(from, to);
        const previous = await summarize(previousFrom, from);

        // Courbe : un point par jour jusqu'à 92 jours, par semaine au-delà.
        const bucket = span > 92 * DAY ? 'week' : 'day';
        const timeline = await pool.query(
            `WITH buckets AS (
                SELECT generate_series(
                    date_trunc($1, $2::date),
                    date_trunc($1, $3::date),
                    ('1 ' || $1)::interval
                )::date AS start
             )
             SELECT to_char(b.start, 'YYYY-MM-DD') AS date,
                    COALESCE(SUM(o.total) FILTER (WHERE o.status = 'payé'), 0) AS revenue,
                    COUNT(o.id) FILTER (WHERE o.status = 'payé') AS orders
             FROM buckets b
             LEFT JOIN orders o
               ON date_trunc($1, o.created_at AT TIME ZONE '${TZ}')::date = b.start
              AND o.created_at >= $4 AND o.created_at < $5
             GROUP BY b.start
             ORDER BY b.start`,
            [bucket, fromDate, toDate, from, to]
        );

        const payments = await pool.query(
            `SELECT COALESCE(payment_method, 'non-precise') AS label,
                    COUNT(*) AS qty,
                    SUM(total) AS revenue
             FROM orders
             WHERE status = 'payé' AND created_at >= $1 AND created_at < $2
             GROUP BY 1
             ORDER BY revenue DESC`,
            [from, to]
        );

        const orders = await pool.query(
            `SELECT o.id, o.status, o.total, o.created_at, o.payment_method, u.name AS customer,
                    (SELECT COALESCE(SUM(qty), 0) FROM order_items WHERE order_id = o.id) AS items
             FROM orders o
             JOIN users u ON u.id = o.user_id
             WHERE o.created_at >= $1 AND o.created_at < $2
             ORDER BY o.created_at DESC
             LIMIT 100`,
            [from, to]
        );

        const store = await pool.query(
            `SELECT
                (SELECT COUNT(*) FROM products) AS products,
                (SELECT COUNT(*) FROM teams) AS teams,
                (SELECT COUNT(*) FROM users WHERE NOT is_admin) AS accounts,
                (SELECT COUNT(*) FROM users WHERE NOT is_admin AND created_at >= $1 AND created_at < $2) AS new_accounts`,
            [from, to]
        );
        const storeRow = store.rows[0];

        res.json({
            from: fromDate,
            to: toDate,
            bucket,
            summary,
            previous,
            store: {
                products: toInt(storeRow.products),
                teams: toInt(storeRow.teams),
                accounts: toInt(storeRow.accounts),
                new_accounts: toInt(storeRow.new_accounts)
            },
            timeline: timeline.rows.map(row => ({
                date: row.date,
                revenue: toInt(row.revenue),
                orders: toInt(row.orders)
            })),
            top_products: await breakdown('oi.name', from, to, 8),
            by_league: await breakdown("COALESCE(l.name, p.league, 'Non classé')", from, to, 50),
            by_category: await breakdown("COALESCE(p.category, 'Non classé')", from, to, 50),
            by_payment: payments.rows.map(row => ({ label: row.label, qty: toInt(row.qty), revenue: toInt(row.revenue) })),
            orders: orders.rows.map(row => ({ ...row, total: toInt(row.total), items: toInt(row.items) }))
        });
    } catch (err) {
        next(err);
    }
});

module.exports = router;
