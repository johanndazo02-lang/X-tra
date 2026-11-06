require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');

const products = [
    ['Maillot FC Barcelone domicile 2026/2027', 40000, '/Images/Barça 2026-2027.jpg', 'LaLiga'],
    ['Maillot Arsenal extérieur 2026/2027', 40000, '/Images/Arsenal2 2026-2027.jpg', 'Premier League'],
    ['Maillot Liverpool FC domicile 2026/2027', 40000, '/Images/liverpool.jpg', 'Premier League'],
    ['Maillot Bayern Munich domicile 2026/2027', 40000, '/Images/maillot-bayern-munich-2026-2027-adidas-domicile-3-1024x1024.jpeg', 'Bundesliga'],
    ['Maillot Atlético Madrid domicile 2026/2027', 40000, '/Images/maillot-atletico-madrid-domicile-2026-2027.jpg', 'LaLiga']
];

async function init(){
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    await pool.query(schema);
    console.log('Tables créées.');

    const { rows } = await pool.query('SELECT COUNT(*) FROM products');
    if(parseInt(rows[0].count, 10) === 0){
        for(const [name, price, image_url, league] of products){
            await pool.query(
                'INSERT INTO products (name, price, image_url, league) VALUES ($1, $2, $3, $4)',
                [name, price, image_url, league]
            );
        }
        console.log('Produits initiaux insérés.');
    } else {
        for(const [name, , , league] of products){
            await pool.query('UPDATE products SET league = $1 WHERE name = $2', [league, name]);
        }
        console.log('Championnats des produits existants mis à jour.');
    }

    console.log('Base de données initialisée.');
    await pool.end();
}

init().catch(err => {
    console.error(err);
    process.exit(1);
});
