require('dotenv').config();
const pool = require('./db');
const { preferPng } = require('./image-path');

const TEAM_NAME = 'Real Madrid';
const IMG_BASE = '/Images/Maillots/Liga/Real Madrid/';
const BRAND = 'adidas';
const SIZES = 'S,M,L,XL,XXL';
const PLAYERS = 'Jude Bellingham, Vinícius Júnior, Kylian Mbappé, Rodrygo, Federico Valverde et Thibaut Courtois';

// Catalogue réel 2026/2027 (photos officielles téléchargées par l'utilisateur,
// vérifiées une par une : les visuels non officiels / floqués d'un filigrane
// tiers ont été exclus de ce catalogue).
const catalog = [
    // Maillots
    { file: '2026-27_maillot-domicile-real-madrid-2026-27.jpg', name: 'Maillot Real Madrid domicile 2026/2027', category: 'Maillots', type: 'Domicile', design: 'Bicolore', colors: 'Blanc / Rose / Vert sapin', price: 40000 },
    { file: '2026-27_maillot-exterieur-real-madrid-2026-27.jpg', name: 'Maillot Real Madrid extérieur 2026/2027', category: 'Maillots', type: 'Extérieur', design: 'Motif', colors: 'Vert sapin', price: 40000 },
    { file: '2026-27_troisieme-maillot-real-madrid-2026-27.jpg', name: 'Troisième maillot Real Madrid 2026/2027', category: 'Maillots', type: 'Third', design: 'Bicolore', colors: 'Rose / Vert sapin', price: 40000 },
    { file: '2026-27_maillot-g-1-real-madrid-2026-27.jpg', name: 'Maillot gardien Real Madrid 2026/2027 (1)', category: 'Maillots', type: 'Gardien 1', design: 'Motif', colors: 'Noir', price: 45000 },
    { file: '2026-27_maillot-g-2-real-madrid-2026-27.jpg', name: 'Maillot gardien Real Madrid 2026/2027 (2)', category: 'Maillots', type: 'Gardien 2', design: 'Bicolore', colors: 'Bleu ciel / Jaune', price: 45000 },
    { file: '2026-27_maillot-g-3-real-madrid-2026-27.jpg', name: 'Maillot gardien Real Madrid 2026/2027 (3)', category: 'Maillots', type: 'Gardien 3', design: 'Motif', colors: 'Orange', price: 45000 },
    { file: '2026-27_maillot-g-4-real-madrid-2026-27.jpg', name: 'Maillot gardien Real Madrid 2026/2027 (4)', category: 'Maillots', type: 'Gardien 4', design: 'Uni', colors: 'Jaune / Bleu', price: 45000 },
    { file: '2026-27_maillot-g-5-real-madrid-2026-27.jpg', name: 'Maillot gardien Real Madrid 2026/2027 (5)', category: 'Maillots', type: 'Gardien 5', design: 'Motif', colors: 'Gris clair', price: 45000 },

    // Ligue des Champions
    { file: '2026-27_jacket-ligue-des-champions-banc-real-madrid-2026-27.jpg', name: 'Veste banc Ligue des Champions Real Madrid 2026/2027', category: 'Ligue des Champions', type: 'Veste Banc', design: 'Bicolore', colors: 'Vert sapin / Bordeaux', price: 80000 },
    { file: '2026-27_jacket-ligue-des-champions-pluie-real-madrid-2026-27.jpg', name: 'Veste de pluie Ligue des Champions Real Madrid 2026/2027', category: 'Ligue des Champions', type: 'Veste Pluie', design: 'Tricolore', colors: 'Blanc / Vert sapin / Rose', price: 70000 },
    { file: '2026-27_jacket-ligue-des-champions-poursuivre-real-madrid-2026-27.jpg', name: 'Veste Poursuivre Ligue des Champions Real Madrid 2026/2027', category: 'Ligue des Champions', type: 'Veste Poursuivre', design: 'Bicolore', colors: 'Blanc / Vert sapin', price: 55000 },
    { file: '2026-27_jacket-ligue-des-champions-poursuivre-2-real-madrid-2026-27.jpg', name: 'Veste Poursuivre Ligue des Champions Real Madrid 2026/2027 (2)', category: 'Ligue des Champions', type: 'Veste Poursuivre 2', design: 'Bicolore', colors: 'Blanc / Vert sapin', price: 55000 },
    { file: '2026-27_shirt-ligue-des-champions-formation-real-madrid-2026-27.jpg', name: 'Maillot d’entraînement Ligue des Champions Real Madrid 2026/2027', category: 'Ligue des Champions', type: 'Formation', design: 'Tricolore', colors: 'Blanc / Vert sapin / Rose', price: 32000 },
    { file: '2026-27_shirt-ligue-des-champions-formation-vest-real-madrid-2026-27.jpg', name: 'Débardeur d’entraînement Ligue des Champions Real Madrid 2026/2027', category: 'Ligue des Champions', type: 'Formation Débardeur', design: 'Tricolore', colors: 'Blanc / Vert sapin / Rose', price: 28000 },
    { file: '2026-27_ligue-des-champions-voyage-jacket-real-madrid-2026-27.jpg', name: 'Veste de voyage Ligue des Champions Real Madrid 2026/2027', category: 'Ligue des Champions', type: 'Veste Voyage', design: 'Bicolore', colors: 'Blanc / Vert sapin', price: 65000 },
    { file: '2026-27_ligue-des-champions-voyage-polo-shirt-real-madrid-2026-27.jpg', name: 'Polo de voyage Ligue des Champions Real Madrid 2026/2027', category: 'Ligue des Champions', type: 'Polo Voyage', design: 'Tricolore', colors: 'Blanc / Vert sapin / Rose', price: 35000 },

    // Avant-match
    { file: '2026-27_shirt-avant-le-match-real-madrid-2026-27.jpg', name: 'Maillot avant-match Real Madrid 2026/2027', category: 'Avant-match', type: 'Avant-match', design: 'Motif', colors: 'Vert sapin', price: 35000 },
    { file: '2026-27_shirt-avant-le-match-exterieur-real-madrid-2026-27.jpg', name: 'Maillot avant-match extérieur Real Madrid 2026/2027', category: 'Avant-match', type: 'Avant-match Extérieur', design: 'Bicolore', colors: 'Rose / Vert sapin', price: 35000 },
    { file: '2026-27_jacket-anthem-domicile-real-madrid-2026-27.jpg', name: 'Veste Anthem domicile Real Madrid 2026/2027', category: 'Avant-match', type: 'Anthem Domicile', design: 'Bicolore', colors: 'Blanc / Bordeaux', price: 75000 },
    { file: '2026-27_jacket-anthem-exterieur-real-madrid-2026-27.jpg', name: 'Veste Anthem extérieur Real Madrid 2026/2027', category: 'Avant-match', type: 'Anthem Extérieur', design: 'Tricolore', colors: 'Écru / Vert sapin / Rose', price: 75000 },

    // Entraînement
    { file: '2026-27_shirt-formation-real-madrid-2026-27.jpg', name: 'Maillot d’entraînement Real Madrid 2026/2027', category: 'Entraînement', type: 'Formation', design: 'Bicolore', colors: 'Vert sapin / Rose', price: 32000 },
    { file: '2026-27_shirt-formation-2-real-madrid-2026-27.jpg', name: 'Maillot d’entraînement Real Madrid 2026/2027 (2)', category: 'Entraînement', type: 'Formation 2', design: 'Bicolore', colors: 'Écru / Rose', price: 32000 },
    { file: '2026-27_shirt-formation-vest-real-madrid-2026-27.jpg', name: 'Débardeur d’entraînement Real Madrid 2026/2027', category: 'Entraînement', type: 'Formation Débardeur', design: 'Bicolore', colors: 'Vert sapin / Bordeaux', price: 28000 },
    { file: '2026-27_jacket-pluie-real-madrid-2026-27.jpg', name: 'Veste de pluie Real Madrid 2026/2027', category: 'Entraînement', type: 'Pluie', design: 'Bicolore', colors: 'Vert sapin / Bordeaux', price: 70000 },
    { file: '2026-27_jacket-pluie-2-real-madrid-2026-27.jpg', name: 'Veste de pluie Real Madrid 2026/2027 (2)', category: 'Entraînement', type: 'Pluie 2', design: 'Bicolore', colors: 'Blanc / Rose', price: 70000 },
    { file: '2026-27_jacket-poursuivre-real-madrid-2026-27.jpg', name: 'Veste Poursuivre Real Madrid 2026/2027', category: 'Entraînement', type: 'Poursuivre', design: 'Uni', colors: 'Vert sapin', price: 55000 },
    { file: '2026-27_jacket-poursuivre-2-real-madrid-2026-27.jpg', name: 'Veste Poursuivre Real Madrid 2026/2027 (2)', category: 'Entraînement', type: 'Poursuivre 2', design: 'Uni', colors: 'Écru / Rose', price: 55000 },
    { file: '2026-27_jacket-poursuivre-3-real-madrid-2026-27.jpg', name: 'Veste Poursuivre Real Madrid 2026/2027 (3)', category: 'Entraînement', type: 'Poursuivre 3', design: 'Bicolore', colors: 'Vert sapin / Rose', price: 55000 },

    // Voyage
    { file: '2026-27_voyage-hoodie-real-madrid-2026-27.jpg', name: 'Sweat à capuche de voyage Real Madrid 2026/2027', category: 'Voyage', type: 'Hoodie', design: 'Bicolore', colors: 'Écru / Vert sapin', price: 60000 },
    { file: '2026-27_voyage-jacket-real-madrid-2026-27.jpg', name: 'Veste de voyage Real Madrid 2026/2027', category: 'Voyage', type: 'Veste', design: 'Bicolore', colors: 'Vert sapin / Rose', price: 65000 },
    { file: '2026-27_voyage-jacket-2-real-madrid-2026-27.jpg', name: 'Veste de voyage Real Madrid 2026/2027 (2)', category: 'Voyage', type: 'Veste 2', design: 'Bicolore', colors: 'Écru / Bordeaux', price: 65000 },
    { file: '2026-27_voyage-jacket-3-real-madrid-2026-27.jpg', name: 'Veste de voyage Real Madrid 2026/2027 (3)', category: 'Voyage', type: 'Veste 3', design: 'Uni', colors: 'Marine', price: 65000 },
    { file: '2026-27_voyage-jacket-4-real-madrid-2026-27.jpg', name: 'Veste de voyage Real Madrid 2026/2027 (4)', category: 'Voyage', type: 'Veste 4', design: 'Tricolore', colors: 'Noir / Violet / Blanc', price: 68000 },
    { file: '2026-27_voyage-jacket-5-real-madrid-2026-27.jpg', name: 'Veste de voyage Real Madrid 2026/2027 (5)', category: 'Voyage', type: 'Veste 5', design: 'Bicolore', colors: 'Écru / Bordeaux', price: 72000 },
    { file: '2026-27_voyage-jacket-6-real-madrid-2026-27.jpg', name: 'Veste de voyage Real Madrid 2026/2027 (6)', category: 'Voyage', type: 'Veste 6', design: 'Bicolore', colors: 'Vert sapin / Bordeaux', price: 72000 },
    { file: '2026-27_voyage-polo-shirt-real-madrid-2026-27.jpg', name: 'Polo de voyage Real Madrid 2026/2027', category: 'Voyage', type: 'Polo', design: 'Bicolore', colors: 'Vert sapin / Rose', price: 35000 },
    { file: '2026-27_voyage-polo-shirt-2-real-madrid-2026-27.jpg', name: 'Polo de voyage Real Madrid 2026/2027 (2)', category: 'Voyage', type: 'Polo 2', design: 'Bicolore', colors: 'Écru / Bordeaux', price: 35000 },
    { file: '2026-27_voyage-shirt-real-madrid-2026-27.jpg', name: 'T-shirt de voyage Real Madrid 2026/2027', category: 'Voyage', type: 'Shirt', design: 'Bicolore', colors: 'Vert sapin / Bordeaux', price: 30000 },
    { file: '2026-27_voyage-shirt-2-real-madrid-2026-27.jpg', name: 'T-shirt de voyage Real Madrid 2026/2027 (2)', category: 'Voyage', type: 'Shirt 2', design: 'Bicolore', colors: 'Écru / Bordeaux', price: 30000 },
    { file: '2026-27_voyage-shirt-3-real-madrid-2026-27.jpg', name: 'T-shirt de voyage Real Madrid 2026/2027 (3)', category: 'Voyage', type: 'Shirt 3', design: 'Uni', colors: 'Marine', price: 30000 },
    { file: '2026-27_voyage-shirt-4-real-madrid-2026-27.jpg', name: 'T-shirt de voyage Real Madrid 2026/2027 (4)', category: 'Voyage', type: 'Shirt 4', design: 'Bicolore', colors: 'Écru / Bordeaux', price: 30000 },
    { file: '2026-27_voyage-shirt-5-real-madrid-2026-27.jpg', name: 'T-shirt de voyage Real Madrid 2026/2027 (5)', category: 'Voyage', type: 'Shirt 5', design: 'Tricolore', colors: 'Blanc / Noir / Violet', price: 30000 },
    { file: '2026-27_voyage-sweatshirt-real-madrid-2026-27.jpg', name: 'Sweat de voyage Real Madrid 2026/2027', category: 'Voyage', type: 'Sweatshirt', design: 'Uni', colors: 'Marine', price: 55000 }
];

async function run(){
    const teamResult = await pool.query('SELECT id FROM teams WHERE name = $1', [TEAM_NAME]);
    if(teamResult.rows.length === 0){
        console.error(`Équipe introuvable : ${TEAM_NAME}`);
        process.exit(1);
    }
    const teamId = teamResult.rows[0].id;

    await pool.query(
        `DELETE FROM products WHERE team_id = $1 AND category IN ('Maillots', 'Ligue des Champions', 'Avant-match', 'Entraînement', 'Voyage') AND type != 'Archive historique'`,
        [teamId]
    );

    for(const item of catalog){
        await pool.query(
            `INSERT INTO products (name, price, image_url, team_id, season, season_start_year, type, category, design, colors, brand, sizes, players)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
                item.name,
                item.price,
                preferPng(IMG_BASE + item.file),
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
