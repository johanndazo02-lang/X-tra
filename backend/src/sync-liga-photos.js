// Aligne le catalogue LaLiga sur les photos rangées dans Images/Maillots/Liga/<Club>/<AAAA-AAAA>/.
// - chaque photo est reliée à la fiche du même club / saison / type (créée si elle n'existe pas) ;
// - toute fiche LaLiga sans photo (entraînement, avant-match, voyage, placeholders…) est supprimée,
//   après sauvegarde dans backups/ ;
// - les maillots gardien numérotés « (1) », « (2) »… prennent le nom de leur couleur quand elle est connue.
// Les dossiers « histoire » ne sont pas traités.
// Utilisation : node src/sync-liga-photos.js            (aperçu, ne modifie rien)
//               node src/sync-liga-photos.js --appliquer
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const pool = require('./db');

const APPLY = process.argv.includes('--appliquer');
const SITE_ROOT = path.join(__dirname, '..', '..');
const LIGA_DIR = path.join(SITE_ROOT, 'Images', 'Maillots', 'Liga');
const SIZES = 'S,M,L,XL,XXL';
// Ordre de préférence quand une même photo existe en plusieurs formats (le PNG est la version détourée)
const EXT_ORDER = ['.png', '.avif', '.webp', '.jpg', '.jpeg'];

// Fin des noms de fichiers propre à chaque club (ex. maillot-domicile-getafe-cf-2025-26)
const SLUGS = {
    'Athletic Bilbao': 'athletic-club',
    'Atlético Madrid': 'atletico-madrid',
    'Celta Vigo': 'rc-celta-de-vigo',
    'Espanyol Barcelone': 'rcd-espanyol',
    'FC Barcelone': 'fc-barcelona',
    'Getafe': 'getafe-cf',
    'Levante': 'levante-ud',
    'Osasuna': 'ca-osasuna',
    'Rayo Vallecano': 'rayo-vallecano',
    'Real Betis': 'real-betis',
    'Real Madrid': 'real-madrid',
    'Séville FC': 'sevilla-fc',
    'Valence': 'valencia-cf',
    'Villarreal': 'villarreal-cf'
};

// clé du fichier → [type en base, début du nom affiché, prix]
// Le nom affiché devient « <début> <Club> <saison> ».
const KITS = {
    'maillot-domicile': ['Domicile', 'Maillot domicile', 40000],
    'maillot-exterieur': ['Extérieur', 'Maillot extérieur', 40000],
    'troisieme-maillot': ['Third', 'Troisième maillot', 40000],
    'maillot-troisieme': ['Third', 'Troisième maillot', 40000],
    'quatrieme-maillot': ['Quatrième', 'Quatrième maillot', 40000],
    'cinquieme-maillot': ['Cinquième', 'Cinquième maillot', 40000],
    'maillot-gardien-domicile': ['Gardien Domicile', 'Maillot gardien domicile', 45000],
    'maillot-gardien-exterieur': ['Gardien Extérieur', 'Maillot gardien extérieur', 45000],
    'troisieme-maillot-gardien': ['Gardien Third', 'Troisième maillot gardien', 45000],
    'quatrieme-maillot-gardien': ['Gardien Quatrième', 'Quatrième maillot gardien', 45000],
    'maillot-retro': ['Rétro', 'Maillot rétro', 42000],
    'maillot-gardien-retro': ['Gardien Rétro', 'Maillot gardien rétro', 45000],
    'maillot-copa-del-rey-final': ['Finale Copa del Rey', 'Maillot finale de la Copa del Rey', 42000],
    'maillot-europa-league-exterieur': ['Europa League Extérieur', 'Maillot extérieur Europa League', 42000],
    'maillot-ligue-des-champions-troisieme': ['Ligue des Champions Third', 'Troisième maillot Ligue des champions', 42000],
    'maillot-supercopa-de-espana': ['Supercopa', 'Maillot Supercopa de España', 42000],
    'maillot-supercopa-de-espana-gardien': ['Gardien Supercopa', 'Maillot gardien Supercopa de España', 45000],
    'maillot-clasico': ['Clásico', 'Maillot Clásico', 42000],
    'maillot-domicile-clasico': ['Domicile Clásico', 'Maillot domicile Clásico', 42000],
    'maillot-domicile-clasico-2': ['Domicile Clásico 2', 'Maillot domicile Clásico (2)', 42000],
    'maillot-gardien-clasico': ['Gardien Clásico', 'Maillot gardien Clásico', 45000],
    'maillot-anniversaire': ['Anniversaire', 'Maillot anniversaire', 42000],
    'maillot-special': ['Spécial', 'Maillot spécial', 42000],
    'maillot-pre-saison-domicile': ['Pré-saison Domicile', 'Maillot pré-saison domicile', 42000],
    'maillot-pre-saison-domicile-2': ['Pré-saison Domicile 2', 'Maillot pré-saison domicile (2)', 42000],
    'maillot-pre-saison-exterieur': ['Pré-saison Extérieur', 'Maillot pré-saison extérieur', 42000],
    'maillot-pre-saison-troisieme': ['Pré-saison Third', 'Maillot pré-saison troisième', 42000],
    'maillot-pre-saison-gardien': ['Pré-saison Gardien', 'Maillot pré-saison gardien', 45000]
};

// Anciennes écritures du même type déjà présentes en base
const TYPE_ALIASES = { 'Gardien Third': ['Third Gardien'] };

const describe = (key) => {
    const v2 = key.endsWith('-v2');
    const base = v2 ? key.slice(0, -3) : key;
    let kit;
    const gk = base.match(/^maillot-(?:g-|gk)(\d+)$/);
    if(gk){
        kit = [`Gardien ${gk[1]}`, `Maillot gardien`, 45000, gk[1]];
    } else if(KITS[base]){
        kit = KITS[base];
    } else {
        return null;
    }
    return {
        type: v2 ? `${kit[0]} v2` : kit[0],
        label: kit[1],
        price: kit[2],
        number: kit[3] || null,
        v2
    };
};

const buildName = (kit, team, season) => {
    let name = `${kit.label} ${team} ${season}`;
    if(kit.number) name += ` (${kit.number})`;
    if(kit.v2) name += ' — version 2';
    return name;
};

// Photos d'un dossier saison, une seule par nom (format préféré)
const listPhotos = (dir) => {
    const byBase = new Map();
    for(const file of fs.readdirSync(dir)){
        const ext = path.extname(file).toLowerCase();
        if(!EXT_ORDER.includes(ext)) continue;
        const base = path.basename(file, path.extname(file));
        const current = byBase.get(base);
        if(!current || EXT_ORDER.indexOf(ext) < EXT_ORDER.indexOf(path.extname(current).toLowerCase())){
            byBase.set(base, file);
        }
    }
    return byBase;
};

const baseOf = (url) => (url ? path.basename(url, path.extname(url)) : '');

async function run(){
    const client = await pool.connect();
    const report = { linked: 0, created: 0, renamed: 0, deleted: 0, unknown: [] };
    const deletedRows = [];

    try {
        await client.query('BEGIN');

        const teams = (await client.query(
            `SELECT t.id, t.name FROM teams t JOIN leagues l ON l.id = t.league_id
             WHERE l.name = 'LaLiga' ORDER BY t.name`
        )).rows;

        for(const team of teams){
            const slug = SLUGS[team.name];
            const clubDir = path.join(LIGA_DIR, team.name);
            const products = (await client.query(
                'SELECT * FROM products WHERE team_id = $1 ORDER BY id', [team.id]
            )).rows;
            const kept = new Set();
            const lines = [];

            if(!slug || !fs.existsSync(clubDir)){
                console.log(`\n${team.name} : pas de dossier photos, rien n'est modifié.`);
                continue;
            }

            const seasonDirs = fs.readdirSync(clubDir).filter(d => /^\d{4}-\d{4}$/.test(d));
            for(const seasonDir of seasonDirs){
                const year = Number(seasonDir.slice(0, 4));
                const seasonLabel = `${year}/${year + 1}`;
                // ex. dossier 2025-2026 → fichiers « …-getafe-cf-2025-26 »
                const suffix = `-${slug}-${seasonDir.slice(0, 4)}-${seasonDir.slice(7, 9)}`;

                for(const [base, file] of listPhotos(path.join(clubDir, seasonDir))){
                    if(!base.endsWith(suffix)){
                        report.unknown.push(`${team.name}/${seasonDir}/${file} (nom inattendu)`);
                        continue;
                    }
                    const kit = describe(base.slice(0, -suffix.length));
                    if(!kit){
                        report.unknown.push(`${team.name}/${seasonDir}/${file} (type inconnu)`);
                        continue;
                    }
                    const imageUrl = `/Images/Maillots/Liga/${team.name}/${seasonDir}/${file}`;
                    const types = [kit.type, ...(TYPE_ALIASES[kit.type] || [])];

                    // 1) fiche déjà reliée à cette photo, 2) fiche du même type et de la même saison
                    let product = products.find(p => !kept.has(p.id) && baseOf(p.image_url) === base);
                    if(!product){
                        product = products.find(p => !kept.has(p.id) && p.category === 'Maillots'
                            && p.season_start_year === year && types.includes(p.type));
                    }

                    if(product){
                        kept.add(product.id);
                        const wasPlaceholder = !product.image_url || product.image_url.includes('placeholder');
                        if(product.image_url !== imageUrl){
                            if(APPLY){
                                await client.query(
                                    `UPDATE products SET image_url = $1, name = $2, type = $3, sizes = COALESCE(sizes, $4)
                                     WHERE id = $5`,
                                    [imageUrl, wasPlaceholder ? buildName(kit, team.name, seasonLabel) : product.name,
                                     kit.type, SIZES, product.id]
                                );
                            }
                            report.linked++;
                            lines.push(`  relié   ${seasonDir} ${file}`);
                        }
                    } else {
                        const name = buildName(kit, team.name, seasonLabel);
                        if(APPLY){
                            const inserted = await client.query(
                                `INSERT INTO products (name, price, image_url, league, team_id, season, season_start_year, type, category, sizes)
                                 VALUES ($1, $2, $3, 'LaLiga', $4, $5, $6, $7, 'Maillots', $8) RETURNING id`,
                                [name, kit.price, imageUrl, team.id, seasonLabel, year, kit.type, SIZES]
                            );
                            kept.add(inserted.rows[0].id);
                        }
                        report.created++;
                        lines.push(`  créé    ${seasonDir} ${name}`);
                    }
                }
            }

            // Fiches sans photo : supprimées (après sauvegarde)
            const toDelete = products.filter(p => !kept.has(p.id));
            for(const p of toDelete){
                deletedRows.push(p);
                lines.push(`  suppr.  ${p.category} — ${p.name}`);
            }
            if(APPLY && toDelete.length > 0){
                const ids = toDelete.map(p => p.id);
                // L'historique des commandes garde le nom et le prix ; on détache seulement le lien
                await client.query('UPDATE order_items SET product_id = NULL WHERE product_id = ANY($1)', [ids]);
                await client.query('DELETE FROM products WHERE id = ANY($1)', [ids]);
            }
            report.deleted += toDelete.length;

            console.log(`\n${team.name} :`);
            lines.forEach(line => console.log(line));
        }

        // Gardiens numérotés : on remplace « (N) » par la couleur quand elle est connue
        const numbered = (await client.query(
            `SELECT p.id, p.name, p.colors, p.season, t.name AS team FROM products p
             JOIN teams t ON t.id = p.team_id JOIN leagues l ON l.id = t.league_id
             WHERE l.name = 'LaLiga' AND p.type ~ '^Gardien [0-9]+( v2)?$' AND p.colors IS NOT NULL`
        )).rows;
        for(const p of numbered){
            const color = p.colors.toLowerCase().replace(/ \/ /g, ' et ');
            const name = `Maillot gardien ${color} ${p.team} ${p.season}`;
            const clash = numbered.some(o => o.id !== p.id && o.team === p.team && o.season === p.season
                && o.colors.toLowerCase() === p.colors.toLowerCase());
            if(clash || name === p.name) continue;
            if(APPLY) await client.query('UPDATE products SET name = $1 WHERE id = $2', [name, p.id]);
            report.renamed++;
            console.log(`  renommé ${p.name}  →  ${name}`);
        }

        if(APPLY){
            const dir = path.join(SITE_ROOT, 'backups');
            fs.mkdirSync(dir, { recursive: true });
            const file = path.join(dir, `liga-fiches-supprimees-${new Date().toISOString().slice(0, 10)}.json`);
            fs.writeFileSync(file, JSON.stringify(deletedRows, null, 2));
            await client.query('COMMIT');
            console.log(`\nSauvegarde des fiches supprimées : ${file}`);
        } else {
            await client.query('ROLLBACK');
        }

        console.log(`\n${APPLY ? 'FAIT' : 'APERÇU (rien n\'a été modifié)'} : ${report.linked} reliée(s), `
            + `${report.created} créée(s), ${report.renamed} renommée(s), ${report.deleted} supprimée(s).`);
        if(report.unknown.length > 0){
            console.log('Photos non traitées :');
            report.unknown.forEach(u => console.log('  - ' + u));
        }
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
