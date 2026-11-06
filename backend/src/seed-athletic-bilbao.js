require('dotenv').config();
const pool = require('./db');

const TEAM_NAME = 'Athletic Bilbao';
const IMG_BASE = '/Images/Maillots/Liga/Athletic Bilbao/';
const BRAND = 'Castore';
const SIZES = 'S,M,L,XL,XXL';
const PLAYERS = 'Nico Williams, Oihan Sancet, Unai Simón, Aymeric Laporte, Iñigo Lekue et Dani Vivian';

// Catalogue réel 2026/2027 (photos officielles téléchargées par l'utilisateur).
const catalog = [
    // Maillots
    { file: '2026-27_maillot-domicile-athletic-club-2026-27.jpg', name: 'Maillot Athletic Bilbao domicile 2026/2027', category: 'Maillots', type: 'Domicile', design: 'Rayé', colors: 'Rouge / Blanc', price: 40000 },
    { file: '2026-27_maillot-exterieur-athletic-club-2026-27.jpg', name: 'Maillot Athletic Bilbao extérieur 2026/2027', category: 'Maillots', type: 'Extérieur', design: 'Uni', colors: 'Noir', price: 40000 },
    { file: '2026-27_troisieme-maillot-athletic-club-2026-27.jpg', name: 'Troisième maillot Athletic Bilbao 2026/2027', category: 'Maillots', type: 'Third', design: 'Motif', colors: 'Bleu ciel', price: 40000 },
    { file: '2026-27_maillot-gardien-domicile-athletic-club-2026-27.jpg', name: 'Maillot gardien domicile Athletic Bilbao 2026/2027', category: 'Maillots', type: 'Gardien Domicile', design: 'Chiné', colors: 'Noir', price: 45000 },
    { file: '2026-27_maillot-gardien-exterieur-athletic-club-2026-27.jpg', name: 'Maillot gardien extérieur Athletic Bilbao 2026/2027', category: 'Maillots', type: 'Gardien Extérieur', design: 'Uni', colors: 'Vert fluo', price: 45000 },
    { file: '2026-27_troisieme-maillot-gardien-athletic-club-2026-27.jpg', name: 'Troisième maillot gardien Athletic Bilbao 2026/2027', category: 'Maillots', type: 'Gardien Third', design: 'Chiné', colors: 'Orange', price: 45000 },

    // Avant-match / Anthem
    { file: '2026-27_shirt-avant-le-match-athletic-club-2026-27.jpg', name: 'Maillot avant-match Athletic Bilbao 2026/2027', category: 'Avant-match', type: 'Avant-match', design: 'Motif', colors: 'Rouge / Noir', price: 35000 },
    { file: '2026-27_shirt-avant-le-match-troisieme-athletic-club-2026-27.jpg', name: 'Maillot avant-match troisième Athletic Bilbao 2026/2027', category: 'Avant-match', type: 'Avant-match Third', design: 'Motif', colors: 'Bleu', price: 35000 },
    { file: '2026-27_avant-le-match-poursuivre-jacket-athletic-club-2026-27.jpg', name: 'Veste avant-match Poursuivre Athletic Bilbao 2026/2027', category: 'Avant-match', type: 'Avant-match Poursuivre', design: 'Bicolore', colors: 'Noir / Rouge', price: 70000 },
    { file: '2026-27_avant-le-match-troisieme-poursuivre-jacket-athletic-club-2026-27.jpg', name: 'Veste avant-match troisième Poursuivre Athletic Bilbao 2026/2027', category: 'Avant-match', type: 'Avant-match Third Poursuivre', design: 'Bicolore', colors: 'Marine / Bleu ciel', price: 70000 },
    { file: '2026-27_jacket-anthem-athletic-club-2026-27.jpg', name: 'Veste Anthem Athletic Bilbao 2026/2027', category: 'Avant-match', type: 'Anthem', design: 'Bicolore', colors: 'Noir / Rouge', price: 75000 },
    { file: '2026-27_jacket-anthem-troisieme-athletic-club-2026-27.jpg', name: 'Veste Anthem troisième Athletic Bilbao 2026/2027', category: 'Avant-match', type: 'Anthem Third', design: 'Uni', colors: 'Marine / Bleu ciel', price: 75000 },

    // Entraînement / Poursuivre
    { file: '2026-27_shirt-formation-athletic-club-2026-27.jpg', name: 'Maillot d’entraînement Athletic Bilbao 2026/2027', category: 'Entraînement', type: 'Formation', design: 'Bicolore', colors: 'Vert menthe / Marine', price: 32000 },
    { file: '2026-27_shirt-formation-2-athletic-club-2026-27.jpg', name: 'Maillot d’entraînement Athletic Bilbao 2026/2027 (2)', category: 'Entraînement', type: 'Formation 2', design: 'Bicolore', colors: 'Marine / Vert menthe', price: 32000 },
    { file: '2026-27_shirt-formation-polo-athletic-club-2026-27.jpg', name: 'Polo d’entraînement Athletic Bilbao 2026/2027', category: 'Entraînement', type: 'Formation Polo', design: 'Bicolore', colors: 'Vert menthe / Marine', price: 38000 },
    { file: '2026-27_shirt-formation-polo-2-athletic-club-2026-27.jpg', name: 'Polo d’entraînement Athletic Bilbao 2026/2027 (2)', category: 'Entraînement', type: 'Formation Polo 2', design: 'Bicolore', colors: 'Marine / Vert menthe', price: 38000 },
    { file: '2026-27_jacket-poursuivre-athletic-club-2026-27.jpg', name: 'Veste Poursuivre Athletic Bilbao 2026/2027', category: 'Entraînement', type: 'Poursuivre', design: 'Bicolore', colors: 'Noir / Rouge', price: 55000 },
    { file: '2026-27_jacket-poursuivre-2-athletic-club-2026-27.jpg', name: 'Veste Poursuivre Athletic Bilbao 2026/2027 (2)', category: 'Entraînement', type: 'Poursuivre 2', design: 'Bicolore', colors: 'Marine / Vert menthe', price: 55000 },

    // Voyage
    { file: '2026-27_voyage-hoodie-athletic-club-2026-27.jpg', name: 'Sweat à capuche de voyage Athletic Bilbao 2026/2027', category: 'Voyage', type: 'Hoodie', design: 'Uni', colors: 'Vert sapin', price: 60000 },
    { file: '2026-27_voyage-polo-shirt-athletic-club-2026-27.jpg', name: 'Polo de voyage Athletic Bilbao 2026/2027', category: 'Voyage', type: 'Polo', design: 'Uni', colors: 'Vert sapin', price: 35000 },
    { file: '2026-27_voyage-shirt-athletic-club-2026-27.jpg', name: 'T-shirt de voyage Athletic Bilbao 2026/2027', category: 'Voyage', type: 'Shirt', design: 'Uni', colors: 'Vert sapin', price: 30000 },
    { file: '2026-27_voyage-sweatshirt-athletic-club-2026-27.jpg', name: 'Sweat de voyage Athletic Bilbao 2026/2027', category: 'Voyage', type: 'Sweatshirt', design: 'Uni', colors: 'Vert sapin', price: 55000 },
    { file: '2026-27_voyage-vest-athletic-club-2026-27.jpg', name: 'Gilet de voyage Athletic Bilbao 2026/2027', category: 'Voyage', type: 'Vest', design: 'Bicolore', colors: 'Marine / Vert menthe', price: 65000 }
];

async function run(){
    const teamResult = await pool.query('SELECT id FROM teams WHERE name = $1', [TEAM_NAME]);
    if(teamResult.rows.length === 0){
        console.error(`Équipe introuvable : ${TEAM_NAME}`);
        process.exit(1);
    }
    const teamId = teamResult.rows[0].id;

    // Repart d'une base propre pour les catégories concernées, pour ne pas
    // mélanger les anciens placeholders avec le vrai catalogue.
    await pool.query(
        `DELETE FROM products WHERE team_id = $1 AND category IN ('Maillots', 'Avant-match', 'Entraînement', 'Voyage') AND type != 'Archive historique'`,
        [teamId]
    );

    for(const item of catalog){
        await pool.query(
            `INSERT INTO products (name, price, image_url, team_id, season, season_start_year, type, category, design, colors, brand, sizes, players)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
                item.name,
                item.price,
                IMG_BASE + item.file,
                teamId,
                '2026/2027',
                2026,
                item.type,
                item.category,
                item.design,
                item.colors,
                BRAND,
                SIZES,
                PLAYERS
            ]
        );
    }

    console.log(`${catalog.length} produits réels créés pour ${TEAM_NAME}.`);
    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
