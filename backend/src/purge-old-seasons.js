// Ne garde au catalogue que la saison en cours et la précédente.
// Les produits supprimés sont d'abord sauvegardés dans backend/backups/.
// Utilisation : node src/purge-old-seasons.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');
const seasons = require('./seasons');

const now = new Date();
const currentSeasonStart = seasons.currentSeasonStart(now);
const oldestKept = seasons.oldestKeptSeasonStart(now);

async function run(){
    const oldRows = (await pool.query(
        'SELECT * FROM products WHERE season_start_year < $1 ORDER BY id',
        [oldestKept]
    )).rows;

    if(oldRows.length === 0){
        console.log(`Aucun produit antérieur à ${oldestKept}/${oldestKept + 1}.`);
        await pool.end();
        return;
    }

    const backupDir = path.join(__dirname, '..', 'backups');
    fs.mkdirSync(backupDir, { recursive: true });
    const backupFile = path.join(backupDir, `products-avant-${oldestKept}-${now.toISOString().slice(0, 10)}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(oldRows, null, 2));
    console.log(`Sauvegarde : ${backupFile}`);

    const result = await pool.query(
        'DELETE FROM products WHERE season_start_year < $1',
        [oldestKept]
    );

    console.log(`${result.rowCount} produit(s) supprimé(s). Saisons conservées : ${oldestKept}/${oldestKept + 1} et ${currentSeasonStart}/${currentSeasonStart + 1}.`);
    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
