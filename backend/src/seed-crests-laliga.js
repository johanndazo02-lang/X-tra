require('dotenv').config();
const pool = require('./db');

const crestMap = {
    'Real Madrid': 'logo Real Madrid.png',
    'FC Barcelone': 'logo FC Barcelone.png',
    'Atlético Madrid': 'logo Atletico Madrid.png',
    'Athletic Bilbao': 'logo Athletic Bilbao.png',
    'Real Sociedad': 'logo Real Sociedad.png',
    'Real Betis': 'logo Real Betis.png',
    'Villarreal': 'logo Villareal.png',
    'Séville FC': 'logo Séville.png',
    'Girona': 'logo Girona.png',
    'Celta Vigo': 'logo Celta Vigo.png',
    'Rayo Vallecano': 'logo Raya Vallecano.png',
    'Osasuna': 'logo Osasuna.png',
    'Getafe': 'logo Getafe.png',
    'Majorque': 'logo Majorque.png',
    'Deportivo Alavés': 'logo Deportivo Alavés.png',
    'Las Palmas': 'logo Las Palmas.png',
    'Espanyol Barcelone': 'logo Espanyol.png',
    'Leganés': 'logo leganés.png',
    'Real Valladolid': 'logo Real valladolid.png',
    'Valence': 'logo Valence.png',
    'Levante': 'logo Levante.png'
};

async function run(){
    const leagueResult = await pool.query("SELECT id FROM leagues WHERE name = 'LaLiga'");
    if(leagueResult.rows.length === 0){
        console.error('Championnat LaLiga introuvable.');
        process.exit(1);
    }
    const leagueId = leagueResult.rows[0].id;

    let updated = 0;
    for(const [teamName, filename] of Object.entries(crestMap)){
        const crestUrl = '/Images/Logo Club/Liga/' + filename;
        const result = await pool.query(
            'UPDATE teams SET crest_url = $1 WHERE league_id = $2 AND name = $3',
            [crestUrl, leagueId, teamName]
        );
        if(result.rowCount > 0){
            updated++;
        } else {
            console.warn(`Équipe non trouvée en base : ${teamName}`);
        }
    }

    const missing = await pool.query(
        'SELECT name FROM teams WHERE league_id = $1 AND crest_url IS NULL',
        [leagueId]
    );

    console.log(`${updated} logos appliqués.`);
    if(missing.rows.length > 0){
        console.log('Équipes LaLiga sans logo :', missing.rows.map(r => r.name).join(', '));
    }

    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
