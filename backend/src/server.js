require('dotenv').config();
const express = require('express');
const cors = require('cors');

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

app.use((req, res) => {
    res.status(404).json({ error: 'Route introuvable.' });
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
