// Catalogue de base de chaque équipe : maillots domicile et extérieur de la saison
// en cours et de la précédente. Ce sont des fiches placeholder (« Photo à venir »,
// sans couleurs ni design) : on ne décrit pas un maillot qu'on n'a pas vu.
// Le troisième maillot n'est pas créé d'office : tous les clubs n'en sortent pas un
// chaque saison. Les fiches existantes (vraies photos) ne sont jamais écrasées.
// Utilisation : node src/seed-season-catalog.js
require('dotenv').config();
const pool = require('./db');
const { currentSeasonStart, oldestKeptSeasonStart } = require('./seasons');

const PRICE = 40000;
const SIZES = 'S,M,L,XL,XXL';
const KIT_TYPES = [
    { type: 'Domicile', label: 'domicile' },
    { type: 'Extérieur', label: 'extérieur' }
];

async function run(){
    const seasons = [];
    for(let year = oldestKeptSeasonStart(); year <= currentSeasonStart(); year++){
        seasons.push({ year, label: `${year}/${year + 1}` });
    }

    const teams = (await pool.query('SELECT id, name FROM teams ORDER BY id')).rows;

    let created = 0;
    for(const team of teams){
        for(const season of seasons){
            for(const kit of KIT_TYPES){
                const exists = await pool.query(
                    `SELECT id FROM products
                     WHERE team_id = $1 AND category = 'Maillots' AND season_start_year = $2 AND type = $3`,
                    [team.id, season.year, kit.type]
                );
                if(exists.rows.length > 0) continue;

                await pool.query(
                    `INSERT INTO products (name, price, image_url, team_id, category, season, season_start_year, type, sizes)
                     VALUES ($1, $2, $3, $4, 'Maillots', $5, $6, $7, $8)`,
                    [
                        `Maillot ${team.name} ${kit.label} ${season.label}`,
                        PRICE,
                        '/Images/maillot-placeholder.svg',
                        team.id,
                        season.label,
                        season.year,
                        kit.type,
                        SIZES
                    ]
                );
                created++;
            }
        }
    }

    console.log(`${created} maillot(s) ajouté(s) pour ${teams.length} équipes (saisons ${seasons.map(s => s.label).join(' et ')}).`);
    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
