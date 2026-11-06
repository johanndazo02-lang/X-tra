// Remplace les numéros « (1) », « (2) »… des maillots LaLiga par la couleur vue sur la photo
// (photos regardées une par une le 07/11/2026). Les doublons de couleur sont distingués par un
// détail visible (sponsor, badge, rayures). Relançable : ne touche que les fiches listées.
// Utilisation : node src/rename-liga-gardiens.js
require('dotenv').config();
const pool = require('./db');

// id → [couleurs (colonne colors), précision ajoutée au nom ou '']
const GARDIENS = {
    4131: ['Gris', ''], 4132: ['Corail', ''],
    4141: ['Bordeaux', ''], 4142: ['Noir', ''], 4143: ['Bleu ciel', ''],
    4147: ['Orange', ''], 4148: ['Jaune fluo', ''], 4149: ['Marron', ''],
    4156: ['Vert', ''], 4157: ['Violet', ''],
    4162: ['Vert', ''], 4163: ['Gris', ''], 4164: ['Orange', ''], 4165: ['Jaune', ''],
    4169: ['Bleu ciel', ''], 4170: ['Noir', ''],
    4176: ['Anthracite', ''], 4177: ['Violet', ''], 4178: ['Jaune fluo', ''],
    4183: ['Jaune', ''], 4184: ['Blanc', ''], 4185: ['Bleu marine', ''], 4186: ['Marron', ''],
    4194: ['Bleu ciel', ''], 4195: ['Bleu ciel', 'sans badge doré'],
    4196: ['Vert menthe', ''], 4197: ['Vert menthe', 'sans badge doré'],
    4198: ['Corail', ''], 4199: ['Corail', 'sans badge doré'],
    4200: ['Noir', ''], 4202: ['Noir', 'sans badge doré'], 4201: ['Vert émeraude', ''],
    4207: ['Jaune', ''], 4208: ['Rose', ''],
    4211: ['Rose', 'sans sponsor'], 4212: ['Rose', ''],
    4213: ['Bleu ciel', 'sans sponsor'], 4214: ['Bleu ciel', ''],
    4215: ['Jaune', ''], 4216: ['Noir', ''], 4217: ['Jaune / Bleu', ''],
    4223: ['Bleu', ''], 4224: ['Orange', 'sponsor TM Tower'], 4225: ['Orange', ''],
    4226: ['Violet', ''], 4227: ['Vert', ''],
    4229: ['Bleu', ''], 4230: ['Rose', ''], 4231: ['Vert fluo', ''], 4232: ['Orange / Noir', ''],
    4234: ['Bleu nuit', ''], 4235: ['Bleu ciel', ''], 4236: ['Rouge', ''],
    4239: ['Orange', ''], 4240: ['Rose', ''], 4241: ['Noir', '']
};

// Autres fiches numérotées : nom complet choisi d'après la photo
const AUTRES = {
    4154: 'Maillot domicile Clásico FC Barcelone 2025/2026 — logo OR',
    4155: 'Maillot domicile Clásico FC Barcelone 2025/2026 — logo D Play',
    4218: 'Maillot pré-saison domicile Séville FC 2026/2027 — blanc uni',
    4219: 'Maillot pré-saison domicile Séville FC 2026/2027 — fines rayures'
};

async function run(){
    let renamed = 0;
    const rows = (await pool.query(
        `SELECT p.id, p.name, p.season, p.image_url, t.name AS team FROM products p
         JOIN teams t ON t.id = p.team_id WHERE p.id = ANY($1)`,
        [[...Object.keys(GARDIENS), ...Object.keys(AUTRES)].map(Number)]
    )).rows;

    for(const p of rows){
        if(GARDIENS[p.id]){
            const [colors, detail] = GARDIENS[p.id];
            const color = colors.toLowerCase().replace(/ \/ /g, ' et ');
            const name = `Maillot gardien ${color} ${p.team} ${p.season}${detail ? ' — ' + detail : ''}`;
            await pool.query('UPDATE products SET name = $1, colors = $2 WHERE id = $3', [name, colors, p.id]);
            console.log(`${p.name}  →  ${name}`);
        } else {
            // Garde-fou : on vérifie que l'id correspond bien à la photo attendue
            const expected = { 4155: 'domicile-clasico-fc', 4154: 'domicile-clasico-2', 4218: 'pre-saison-domicile-2', 4219: 'pre-saison-domicile-sevilla' }[p.id];
            if(!p.image_url.includes(expected)){
                console.log(`IGNORÉ ${p.id} (${p.image_url}) : photo inattendue`);
                continue;
            }
            await pool.query('UPDATE products SET name = $1 WHERE id = $2', [AUTRES[p.id], p.id]);
            console.log(`${p.name}  →  ${AUTRES[p.id]}`);
        }
        renamed++;
    }
    console.log(`\n${renamed} fiche(s) renommée(s).`);
    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
