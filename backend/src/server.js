require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');

// Racine du site (les pages HTML, CSS, JS et Images), un dossier au-dessus de backend/
const SITE_ROOT = path.join(__dirname, '..', '..');

// Dossiers et fichiers du dépôt qui ne doivent JAMAIS être servis aux visiteurs
// (code serveur, secrets .env, historique git, documentation, configuration).
const BLOCKED_PREFIXES = ['/backend', '/documentation', '/.git', '/.claude', '/.agents', '/node_modules'];

const authRoutes = require('./routes/auth.routes');
const productsRoutes = require('./routes/products.routes');
const ordersRoutes = require('./routes/orders.routes');
const leaguesRoutes = require('./routes/leagues.routes');
const teamsRoutes = require('./routes/teams.routes');
const contactRoutes = require('./routes/contact.routes');
const statsRoutes = require('./routes/stats.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(cors());
// Les photos envoyées depuis l'admin (base64) dépassent la limite par défaut de 100 ko.
app.use('/api/admin/uploads', express.json({ limit: '8mb' }));
app.use('/api/auth/me/avatar', express.json({ limit: '8mb' }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/leagues', leaguesRoutes);
app.use('/api/teams', teamsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin', adminRoutes);

/* ##################### */
/* Pages du site (même adresse que l'API) */
/* ##################### */

app.use((req, res, next) => {
    // decodeURIComponent : bloque aussi les chemins encodés (%2E, majuscules…)
    let requested;
    try {
        requested = decodeURIComponent(req.path).toLowerCase().replace(/\\/g, '/');
    } catch (err) {
        return res.status(400).end();
    }
    if(BLOCKED_PREFIXES.some(prefix => requested === prefix || requested.startsWith(prefix + '/'))){
        return res.status(404).sendFile(path.join(SITE_ROOT, '404.html'));
    }
    next();
});

// dotfiles: 'deny' refuse tout fichier commençant par un point (.env, .gitignore…)
app.use(express.static(SITE_ROOT, { dotfiles: 'deny', index: 'index.html' }));

// Route d'API inconnue → JSON ; page inconnue → la page 404 du site
app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Route introuvable.' });
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(SITE_ROOT, '404.html'));
});

app.use((err, req, res, next) => {
    if(err.type === 'entity.too.large'){
        return res.status(413).json({ error: 'Fichier trop lourd.' });
    }
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API X-Tra en écoute sur http://localhost:${PORT}`);
});
