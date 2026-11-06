/*
 * Après tools/retirer-fonds.py : fait pointer le site vers les PNG détourés.
 * - base de données : image_url des produits (.jpg → .png si le PNG existe)
 * - index.html : les photos de la vitrine « Champions League »
 *
 * Lancement (depuis le dossier X-Tra) :  node tools/utiliser-png.js
 * Sans risque à relancer : seules les photos dont le PNG existe changent.
 */
const fs = require('fs');
const path = require('path');

const BACKEND = path.join(__dirname, '..', 'backend');
require(path.join(BACKEND, 'node_modules', 'dotenv')).config({ path: path.join(BACKEND, '.env'), quiet: true });
const pool = require(path.join(BACKEND, 'src', 'db'));
const { preferPng } = require(path.join(BACKEND, 'src', 'image-path'));

const majBase = async () => {
    const { rows } = await pool.query(
        "SELECT id, image_url FROM products WHERE image_url ~* '\\.(jpe?g|webp|avif)$'"
    );
    let changes = 0;
    for(const product of rows){
        const pngUrl = preferPng(product.image_url);
        if(pngUrl !== product.image_url){
            await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [pngUrl, product.id]);
            changes++;
        }
    }
    console.log(`Base : ${changes} produit(s) passé(s) en PNG (${rows.length - changes} photo(s) sans PNG).`);
};

const majIndex = () => {
    const fichier = path.join(__dirname, '..', 'index.html');
    let html = fs.readFileSync(fichier, 'utf8');
    let changes = 0;
    html = html.replace(/src="(\/Images\/Maillots\/[^"]+\.(?:jpe?g|webp|avif))"/gi, (match, url) => {
        const pngUrl = preferPng(url);
        if(pngUrl === url) return match;
        changes++;
        return `src="${pngUrl}"`;
    });
    fs.writeFileSync(fichier, html);
    console.log(`index.html : ${changes} photo(s) passée(s) en PNG.`);
};

(async () => {
    try {
        await majBase();
        majIndex();
    } catch (err) {
        console.error('Erreur :', err.message);
        process.exitCode = 1;
    } finally {
        await pool.end();
    }
})();
