require('dotenv').config();
const pool = require('./db');
const { oldestKeptSeasonStart } = require('./seasons');

const TEAM_NAME = 'Atlético Madrid';
const IMG_BASE = '/Images/Maillots/Liga/Atlético Madrid/';

// Un seul visuel du lot fourni s'est avéré être une véritable photo produit
// (les cinq autres étaient des photos d'archive ou des concepts non officiels
// floqués d'un filigrane tiers, et ont donc été écartés).
const catalog = [
    {
        file: 'maillot-domicile-athletic-aviacion-club-1939-40.jpg',
        name: 'Maillot Athletic Aviación Club domicile 1939/1940',
        category: 'Maillots',
        type: 'Domicile',
        season: '1939 - 1940',
        seasonStartYear: 1939,
        design: 'Rayé',
        colors: 'Rouge / Blanc',
        price: 40000
    }
];

async function run(){
    const teamResult = await pool.query('SELECT id FROM teams WHERE name = $1', [TEAM_NAME]);
    if(teamResult.rows.length === 0){
        console.error(`Équipe introuvable : ${TEAM_NAME}`);
        process.exit(1);
    }
    const teamId = teamResult.rows[0].id;

    // Seules la saison en cours et la précédente restent au catalogue.
    const recentCatalog = catalog.filter(item => item.seasonStartYear >= oldestKeptSeasonStart());

    for(const item of recentCatalog){
        await pool.query(
            `INSERT INTO products (name, price, image_url, team_id, season, season_start_year, type, category, design, colors)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
                item.name,
                item.price,
                IMG_BASE + item.file,
                teamId,
                item.season,
                item.seasonStartYear,
                item.type,
                item.category,
                item.design,
                item.colors
            ]
        );
    }

    console.log(`${recentCatalog.length} produit(s) réel(s) créé(s) pour ${TEAM_NAME}.`);
    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
