// Supprime un ou plusieurs produits par leur ID.
// Utilisation : node src/delete-products.js 2040 2041 2042
require('dotenv').config();
const pool = require('./db');

async function run(){
    const ids = process.argv.slice(2).map(Number).filter(Boolean);

    if(ids.length === 0){
        console.log('Utilisation : node src/delete-products.js <id1> <id2> ...');
        console.log('Astuce : node src/list-products.js <team_id> pour voir les ID disponibles.');
        process.exit(0);
    }

    const result = await pool.query(
        'DELETE FROM products WHERE id = ANY($1) RETURNING id, name',
        [ids]
    );

    console.log(`${result.rows.length} produit(s) supprimé(s) :`);
    result.rows.forEach(row => console.log(`  - #${row.id} ${row.name}`));

    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
