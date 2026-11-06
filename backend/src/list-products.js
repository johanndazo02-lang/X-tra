// Liste les produits d'une équipe avec leur ID, pour préparer une suppression.
// Utilisation : node src/list-products.js 4
require('dotenv').config();
const pool = require('./db');

async function run(){
    const teamId = Number(process.argv[2]);

    if(!teamId){
        console.log('Utilisation : node src/list-products.js <team_id>');
        process.exit(0);
    }

    const result = await pool.query(
        `SELECT id, name, category, type, season, price
         FROM products
         WHERE team_id = $1
         ORDER BY category, season_start_year DESC NULLS LAST`,
        [teamId]
    );

    result.rows.forEach(row => {
        console.log(`#${row.id}\t${row.category}\t${row.type}\t${row.season}\t${row.name}`);
    });

    console.log(`\n${result.rows.length} produit(s).`);
    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
