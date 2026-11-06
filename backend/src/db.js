const { Pool } = require('pg');

// En ligne (Render + Neon) : une seule variable DATABASE_URL, connexion chiffrée (SSL).
// En local : les variables DB_HOST, DB_USER… du fichier .env.
const pool = process.env.DATABASE_URL
    ? new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    })
    : new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'xtra_user',
        password: process.env.DB_PASSWORD || 'xtra_password',
        database: process.env.DB_NAME || 'xtra',
    });

module.exports = pool;
