// Met en place les vraies photos de maillots fournies par l'utilisateur (octobre 2026).
// Chaque photo a été regardée avant d'en décrire le design et les couleurs.
// Une fiche existante du même club / saison / catégorie / type (souvent un
// placeholder « Photo à venir ») est mise à jour au lieu d'être dupliquée.
// Relançable sans créer de doublons. Utilisation : node src/seed-club-photos.js
require('dotenv').config();
const pool = require('./db');

const SIZES = 'S,M,L,XL,XXL';
const S25 = { label: '2025/2026', year: 2025, folder: '2025-2026' };
const S26 = { label: '2026/2027', year: 2026, folder: '2026-2027' };

// name : nom affiché ; sinon il est construit à partir du type.
const clubs = [
    {
        team: 'Bayer Leverkusen', dir: 'Buendesliga/Bayer Leverkusen', brand: 'New Balance', slug: 'bayer-04-leverkusen',
        kits: [
            { season: S25, file: 'maillot-domicile', type: 'Domicile', design: 'Motif', colors: 'Noir / Rouge' },
            { season: S25, file: 'maillot-exterieur', type: 'Extérieur', design: 'Dégradé', colors: 'Blanc cassé / Rose' },
            { season: S25, file: 'troisieme-maillot', type: 'Third', design: 'Motif', colors: 'Bleu roi' },
            { season: S25, file: 'quatrieme-maillot', type: 'Quatrième', design: 'Uni', colors: 'Blanc / Rouge' },
            { season: S25, file: 'maillot-g-1', type: 'Gardien 1', design: 'Uni', colors: 'Orange' },
            { season: S25, file: 'maillot-g-2', type: 'Gardien 2', design: 'Uni', colors: 'Vert clair' },
            { season: S26, file: 'maillot-domicile', type: 'Domicile', design: 'Rayé', colors: 'Rouge / Noir' },
            { season: S26, file: 'maillot-exterieur', type: 'Extérieur', design: 'Motif', colors: 'Bleu ciel / Marine' },
            { season: S26, file: 'troisieme-maillot', type: 'Third', design: 'Uni', colors: 'Blanc / Rouge' },
            { season: S26, file: 'maillot-europa-league-domicile', type: 'Europa League Domicile', design: 'Rayé', colors: 'Noir / Gris', price: 42000,
              name: 'Maillot domicile Europa League Bayer Leverkusen 2026/2027' },
            { season: S26, file: 'maillot-gardien-domicile', type: 'Gardien Domicile', design: 'Motif', colors: 'Jaune fluo' },
            { season: S26, file: 'maillot-gardien-exterieur', type: 'Gardien Extérieur', design: 'Motif', colors: 'Corail / Marine' }
        ]
    },
    {
        team: 'Bayern Munich', dir: 'Buendesliga/Bayern Munich', brand: 'adidas', slug: 'bayern-munchen',
        kits: [
            { season: S25, file: 'maillot-domicile', type: 'Domicile', design: 'Motif', colors: 'Rouge / Blanc' },
            { season: S25, file: 'maillot-domicile-v2', type: 'Domicile Magenta TV', design: 'Motif', colors: 'Rouge / Blanc',
              name: 'Maillot Bayern Munich domicile 2025/2026 (version Magenta TV)' },
            { season: S25, file: 'maillot-domicile-2', type: 'Domicile 2', design: 'Rayé', colors: 'Rouge / Or',
              name: 'Maillot Bayern Munich domicile 2025/2026 (2)' },
            { season: S25, file: 'maillot-exterieur', type: 'Extérieur', design: 'Camouflage', colors: 'Blanc / Gris / Rose' },
            { season: S25, file: 'maillot-exterieur-v2', type: 'Extérieur Magenta TV', design: 'Camouflage', colors: 'Blanc / Gris / Rose',
              name: 'Maillot Bayern Munich extérieur 2025/2026 manches longues (version Magenta TV)' },
            { season: S25, file: 'troisieme-maillot', type: 'Third', design: 'Motif', colors: 'Noir / Crème' },
            { season: S25, file: 'maillot-troisieme-v2', type: 'Third Magenta TV', design: 'Motif', colors: 'Noir / Crème',
              name: 'Troisième maillot Bayern Munich 2025/2026 (version Magenta TV)' },
            { season: S25, file: 'maillot-oktoberfest', type: 'Oktoberfest', design: 'Uni', colors: 'Beige / Vert', price: 42000,
              name: 'Maillot Oktoberfest Bayern Munich 2025/2026' },
            { season: S25, file: 'maillot-gardien-oktoberfest', type: 'Gardien Oktoberfest', design: 'Uni', colors: 'Rouge / Blanc', price: 45000,
              name: 'Maillot gardien Oktoberfest Bayern Munich 2025/2026' },
            { season: S25, file: 'maillot-g-1', type: 'Gardien 1', design: 'Motif', colors: 'Vert' },
            { season: S25, file: 'maillot-g-2', type: 'Gardien 2', design: 'Motif', colors: 'Noir / Vert clair' },
            { season: S25, file: 'maillot-g-3', type: 'Gardien 3', design: 'Uni', colors: 'Rouge / Blanc' },
            { season: S25, file: 'maillot-g-4', type: 'Gardien 4', design: 'Dégradé', colors: 'Violet' },
            { season: S25, file: 'maillot-g-5', type: 'Gardien 5', design: 'Motif', colors: 'Rouge' },
            { season: S25, file: 'maillot-g-6', type: 'Gardien 6', design: 'Uni', colors: 'Rose / Noir' },
            { season: S26, file: 'maillot-domicile', type: 'Domicile', design: 'Rayé', colors: 'Rouge / Or' },
            { season: S26, file: 'maillot-exterieur', type: 'Extérieur', design: 'Uni', colors: 'Blanc / Marine' },
            { season: S26, file: 'troisieme-maillot', type: 'Third', design: 'Motif', colors: 'Violet / Corail' },
            { season: S26, file: 'maillot-oktoberfest', type: 'Oktoberfest', design: 'Motif floral', colors: 'Multicolore / Noir', price: 42000,
              name: 'Maillot Oktoberfest Bayern Munich 2026/2027' },
            { season: S26, file: 'maillot-gardien-oktoberfest', type: 'Gardien Oktoberfest', design: 'Uni', colors: 'Jaune / Bleu', price: 45000,
              name: 'Maillot gardien Oktoberfest Bayern Munich 2026/2027' },
            { season: S26, file: 'maillot-g-1', type: 'Gardien 1', design: 'Motif', colors: 'Vert' },
            { season: S26, file: 'maillot-g-2', type: 'Gardien 2', design: 'Motif', colors: 'Orange' },
            { season: S26, file: 'maillot-g-3', type: 'Gardien 3', design: 'Uni', colors: 'Rose / Vert' },
            { season: S26, file: 'maillot-g-4', type: 'Gardien 4', design: 'Motif', colors: 'Gris' },
            { season: S26, file: 'maillot-g-5', type: 'Gardien 5', design: 'Uni', colors: 'Jaune / Bleu' }
        ]
    },
    {
        // Fiches 2026/2027 déjà décrites à partir des photos d'origine : seule l'image change.
        team: 'Athletic Bilbao', dir: 'Liga/Athletic Bilbao', brand: 'Castore', slug: 'athletic-club',
        kits: [
            { season: S26, file: 'maillot-domicile', type: 'Domicile' },
            { season: S26, file: 'maillot-exterieur', type: 'Extérieur' },
            { season: S26, file: 'troisieme-maillot', type: 'Third' },
            { season: S26, file: 'maillot-gardien-domicile', type: 'Gardien Domicile' },
            { season: S26, file: 'maillot-gardien-exterieur', type: 'Gardien Extérieur' },
            { season: S26, file: 'troisieme-maillot-gardien', type: 'Gardien Third' }
        ]
    },
    {
        team: 'Atlético Madrid', dir: 'Liga/Atlético Madrid', brand: 'Nike', slug: 'atletico-madrid',
        kits: [
            { season: S25, file: 'maillot-domicile', type: 'Domicile', design: 'Rayé', colors: 'Rouge / Blanc' },
            { season: S25, file: 'maillot-exterieur', type: 'Extérieur', design: 'Rayé', colors: 'Marine / Jaune' },
            { season: S25, file: 'troisieme-maillot', type: 'Third', design: 'Uni', colors: 'Bleu / Rouge' },
            { season: S25, file: 'maillot-copa-del-rey-final', type: 'Finale Copa del Rey', design: 'Rayé', colors: 'Rouge / Blanc', price: 42000,
              name: 'Maillot finale de la Copa del Rey Atlético Madrid 2025/2026' },
            { season: S25, file: 'maillot-retro', type: 'Rétro', design: 'Bicolore', colors: 'Bleu / Blanc', price: 42000,
              name: 'Maillot rétro Atlético Madrid 2025/2026' },
            { season: S25, file: 'maillot-g-1', type: 'Gardien 1', design: 'Rayé', colors: 'Jaune' },
            { season: S25, file: 'maillot-g-2', type: 'Gardien 2', design: 'Rayé', colors: 'Noir / Gris' },
            { season: S25, file: 'maillot-g-3', type: 'Gardien 3', design: 'Rayé', colors: 'Orange' },
            { season: S26, file: 'maillot-domicile', type: 'Domicile', design: 'Rayé', colors: 'Rouge / Blanc / Marine' },
            { season: S26, file: 'maillot-exterieur', type: 'Extérieur', design: 'Uni', colors: 'Noir / Jaune fluo' },
            { season: S26, file: 'troisieme-maillot', type: 'Third', design: 'Rayé', colors: 'Gris clair / Rouge / Marine' },
            { season: S26, file: 'maillot-g-1', type: 'Gardien 1', design: 'Motif', colors: 'Vert' },
            { season: S26, file: 'maillot-g-2', type: 'Gardien 2', design: 'Motif', colors: 'Jaune' },
            { season: S26, file: 'maillot-g-3', type: 'Gardien 3', design: 'Motif', colors: 'Marine / Bleu' },
            { season: S26, file: 'maillot-g-4', type: 'Gardien 4', design: 'Motif', colors: 'Orange' }
        ]
    },
    {
        team: 'AJ Auxerre', dir: 'Ligue 1/AJ Auxerre', brand: 'Macron', slug: 'aj-auxerre',
        kits: [
            { season: S25, file: 'maillot-domicile', type: 'Domicile', design: 'Uni', colors: 'Blanc / Bleu' },
            { season: S25, file: 'maillot-exterieur', type: 'Extérieur', design: 'Motif', colors: 'Noir / Bleu' },
            { season: S25, file: 'troisieme-maillot', type: 'Third', design: 'Bicolore', colors: 'Bleu / Marine' },
            { season: S26, file: 'maillot-domicile', type: 'Domicile', design: 'Uni', colors: 'Blanc / Bleu' },
            { season: S26, file: 'maillot-exterieur', type: 'Extérieur', design: 'Motif', colors: 'Noir / Bleu' },
            { season: S26, file: 'troisieme-maillot', type: 'Third', design: 'Bicolore', colors: 'Bleu / Marine' }
        ]
    },
    {
        team: 'Angers SCO', dir: 'Ligue 1/Angers SCO', brand: 'Nike', slug: 'angers-sco',
        kits: [
            { season: S25, file: 'maillot-domicile', type: 'Domicile', design: 'Rayé', colors: 'Noir / Blanc' },
            { season: S25, file: 'maillot-exterieur', type: 'Extérieur', design: 'Motif', colors: 'Blanc cassé' },
            { season: S25, file: 'maillot-g-1', type: 'Gardien 1', design: 'Motif', colors: 'Rouge' },
            { season: S25, file: 'maillot-g-3', type: 'Gardien 3', design: 'Bicolore', colors: "Vert d'eau / Bleu ciel" },
            { season: S25, file: 'maillot-g-5', type: 'Gardien 5', design: 'Bicolore', colors: 'Gris / Corail' },
            { season: S26, file: 'maillot-domicile', type: 'Domicile', design: 'Rayé', colors: 'Noir / Blanc' },
            { season: S26, file: 'maillot-exterieur', type: 'Extérieur', design: 'Uni', colors: 'Blanc / Gris' },
            { season: S26, file: 'maillot-rose-october', type: 'Octobre Rose', design: 'Motif', colors: 'Blanc / Rose', price: 42000,
              name: 'Maillot Octobre Rose Angers SCO 2026/2027' }
        ]
    }
];

const defaultName = (team, kit) => {
    const season = kit.season.label;
    const gk = kit.type.match(/^Gardien (\d+)$/);
    if(gk) return `Maillot gardien ${team} ${season} (${gk[1]})`;
    switch(kit.type){
        case 'Domicile': return `Maillot ${team} domicile ${season}`;
        case 'Extérieur': return `Maillot ${team} extérieur ${season}`;
        case 'Third': return `Troisième maillot ${team} ${season}`;
        case 'Quatrième': return `Quatrième maillot ${team} ${season}`;
        case 'Gardien Domicile': return `Maillot gardien domicile ${team} ${season}`;
        case 'Gardien Extérieur': return `Maillot gardien extérieur ${team} ${season}`;
        default: return `Maillot ${kit.type.toLowerCase()} ${team} ${season}`;
    }
};

const defaultPrice = (kit) => kit.price || (kit.type.startsWith('Gardien') ? 45000 : 40000);

async function run(){
    let updated = 0;
    let created = 0;

    for(const club of clubs){
        const teamResult = await pool.query('SELECT id FROM teams WHERE name = $1', [club.team]);
        if(teamResult.rows.length === 0){
            console.error(`Équipe introuvable : ${club.team}`);
            continue;
        }
        const teamId = teamResult.rows[0].id;

        for(const kit of club.kits){
            const shortSeason = `${kit.season.year}-${String(kit.season.year + 1).slice(2)}`;
            const imageUrl = `/Images/Maillots/${club.dir}/${kit.season.folder}/${kit.file}-${club.slug}-${shortSeason}.jpg`;

            const existing = await pool.query(
                `SELECT id FROM products
                 WHERE team_id = $1 AND category = 'Maillots' AND season_start_year = $2 AND type = $3
                 ORDER BY id LIMIT 1`,
                [teamId, kit.season.year, kit.type]
            );

            if(existing.rows.length > 0 && !kit.design){
                // Fiche déjà décrite : on ne fait que rebrancher la photo.
                await pool.query('UPDATE products SET image_url = $1 WHERE id = $2', [imageUrl, existing.rows[0].id]);
                updated++;
                continue;
            }

            const values = [
                kit.name || defaultName(club.team, kit),
                defaultPrice(kit),
                imageUrl,
                kit.season.label,
                kit.season.year,
                kit.type,
                kit.design,
                kit.colors,
                club.brand,
                SIZES
            ];

            if(existing.rows.length > 0){
                await pool.query(
                    `UPDATE products SET name = $1, price = $2, image_url = $3, season = $4, season_start_year = $5,
                        type = $6, design = $7, colors = $8, brand = $9, sizes = $10
                     WHERE id = $11`,
                    [...values, existing.rows[0].id]
                );
                updated++;
            } else {
                await pool.query(
                    `INSERT INTO products (name, price, image_url, season, season_start_year, type, design, colors, brand, sizes, team_id, category)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'Maillots')`,
                    [...values, teamId]
                );
                created++;
            }
        }
    }

    console.log(`${updated} fiche(s) mise(s) à jour, ${created} fiche(s) créée(s).`);
    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
