require('dotenv').config();
const pool = require('./db');

// Catégories de produits au-delà des maillots (comme dans les boutiques
// officielles) : une entrée placeholder par catégorie et par équipe.
const categories = [
    { key: 'Avant-match', label: (team) => `Veste avant-match ${team}`, price: 65000 },
    { key: 'Entraînement', label: (team) => `Maillot d'entraînement ${team}`, price: 35000 },
    { key: 'Voyage', label: (team) => `Sweat de voyage ${team}`, price: 55000 }
];

async function run(){
    const teamsResult = await pool.query('SELECT id, name FROM teams ORDER BY id');

    let created = 0;
    for(const team of teamsResult.rows){
        for(const category of categories){
            const exists = await pool.query(
                'SELECT id FROM products WHERE team_id = $1 AND category = $2',
                [team.id, category.key]
            );
            if(exists.rows.length === 0){
                await pool.query(
                    `INSERT INTO products (name, price, image_url, team_id, category, season, season_start_year, type)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        category.label(team.name),
                        category.price,
                        '/Images/maillot-placeholder.svg',
                        team.id,
                        category.key,
                        '2026/2027',
                        2026,
                        category.key
                    ]
                );
                created++;
            }
        }
    }

    console.log(`${created} nouveaux produits créés (${teamsResult.rows.length} équipes × ${categories.length} catégories).`);
    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
