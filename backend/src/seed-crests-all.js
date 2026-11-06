require('dotenv').config();
const pool = require('./db');

// Pour chaque championnat : correspondance nom d'équipe (existante en base, ou
// nouvelle à créer) -> fichier logo réel dans Images/Logo Club/<dossier>/
const leagues = {
    'LaLiga': {
        folder: 'Liga',
        crests: {
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
            'Levante': 'logo Levante.png',
            'Malaga': 'logo Malaga.png' // nouvelle équipe (logo fourni, pas encore en base)
        }
    },
    'Bundesliga': {
        folder: 'Buendesliga',
        crests: {
            'Bayern Munich': 'logo Bayern Munich.png',
            'Bayer Leverkusen': 'logo Bayer Leverkusen.png',
            'RB Leipzig': 'logo RB Leipzig.png',
            'Borussia Dortmund': 'logo Dortmund.png',
            'Eintracht Francfort': 'logo Eintracht Francfort.png',
            'VfB Stuttgart': 'logo Stuttgart.png',
            'Borussia Mönchengladbach': 'logo Borussia Mönchengladbach.png',
            'SC Fribourg': 'logo SC Fribourg.png',
            'Werder Brême': 'logo Werder Brême.png',
            'Mayence 05': 'logo FSC Mainz.png',
            'Union Berlin': 'logo FC Union Berlin.png',
            'FC Augsbourg': 'logo Augsbourg.png',
            'TSG Hoffenheim': 'logo TSG 1899 Hoffenheim.png',
            // nouvelles équipes (logo fourni, pas encore en base) :
            'SV Elversberg': 'logo Elversberg.png',
            'FC Cologne': 'logo FC Cologne.png',
            'Schalke 04': 'logo FC Schalke 04.png',
            'Hambourg SV': 'logo Hambourg SV.png',
            'SC Paderborn': 'logo SC Paderborn.png',
            'VfL Wolfsburg': 'logo VfL Wolfsburg.png',
            'FC Heidenheim': 'logo FC Heidenheim 1846.png',
            'VfL Bochum': 'logo VfL Bochum.png',
            'FC St. Pauli': 'logo FC St.Pauli.png',
            'Holstein Kiel': 'logo Kieler SV Holstein.png'
        }
    },
    'Premier League': {
        folder: 'Premier League',
        crests: {
            'Arsenal': 'logo Arsenal.png',
            'Aston Villa': 'logo Aston Villa.png',
            'Bournemouth': 'logo Bournmouth.png',
            'Brentford': 'logo Brentford.png',
            'Brighton & Hove Albion': 'logo Brighton.png',
            'Chelsea': 'logo Chelsea.png',
            'Crystal Palace': 'logo Crystal Palace.png',
            'Everton': 'logo Everton.png',
            'Fulham': 'logo Fulham.png',
            'Ipswich Town': 'logo Ipswich Town.png',
            'Liverpool': 'logo Liverpool.png',
            'Manchester City': 'logo Manchester City.png',
            'Manchester United': 'logo Manchester United.png',
            'Newcastle United': 'logo Newcastle.png',
            'Nottingham Forest': 'logo Nottingham Forest.png',
            'Tottenham Hotspur': 'logo Tottenham.png',
            // nouvelles équipes (logo fourni, pas encore en base) :
            'Coventry City': 'logo Coventry City.png',
            'Hull City': 'logo Hull City.png',
            'Leeds United': 'logo Leeds United.png',
            'Sunderland': 'logo Sunderland.png',
            'Leicester City': 'logo Leicester City Football Club.png',
            'Southampton': 'logo Southampton Football Club.png',
            'West Ham United': 'logo West Ham United Football Club.png',
            'Wolverhampton Wanderers': 'logo Wolverhampton Wanderers Football Club.png'
        }
    },
    'Ligue 1': {
        folder: 'Ligue 1',
        crests: {
            'AS Monaco': 'logo AS Monaco.png',
            'Angers SCO': "logo Angers Sporting Club de l'Ouest.png",
            'AJ Auxerre': 'logo Association de la jeunesse auxerroise.png',
            'LOSC Lille': 'logo LOSC Lille.png',
            'Le Havre AC': 'logo Le Havre Athlétic Club.png',
            'OGC Nice': 'logo OGC Nice.png',
            'Olympique Lyonnais': 'logo Olympique Lyonnais.png',
            'Olympique de Marseille': 'logo Olympique de Marseille.png',
            'Paris Saint-Germain': 'logo Paris Saint-Germain.png',
            'RC Lens': 'logo RC Lens.png',
            'RC Strasbourg': 'logo RC Strasbourg.png',
            'Stade Brestois': 'logo Stade Brestois 29.png',
            'Stade Rennais': 'logo Stade Rennais.png',
            'Toulouse FC': 'logo Toulouse Football Club.png',
            // nouvelles équipes (logo fourni, pas encore en base) :
            'Troyes': 'logo Espérance sportive Troyes Aube Champagne.png',
            'FC Lorient': 'logo FC Lorient.png',
            'Le Mans FC': 'logo Le Mans Football Club.png',
            'Paris FC': 'logo Paris FC.png',
            'AS Saint-Étienne': 'logo Association sportive de Saint-Étienne.png',
            'FC Nantes': 'logo Football Club de Nantes.png',
            'Montpellier HSC': 'logo Montpellier Hérault Sport Club.png',
            'Stade de Reims': 'logo Stade de Reims.png'
        }
    },
    'Serie A': {
        folder: 'Serie A',
        crests: {
            'Fiorentina': 'logo ACF Fiorentina.png',
            'AC Milan': 'logo Associazione Calcio Milan.png',
            'AC Monza': 'logo Associazione Calcio Monza.png',
            'AS Rome': 'logo Associazione Sportiva Roma.png',
            'Atalanta Bergame': 'logo Atalanta Bergame.png',
            'Bologne': 'logo Bologne FC 1909.png',
            'Cagliari': 'logo Cagliari Calcio.png',
            'Côme 1907': 'logo Como 1907.png',
            'Gênes CFC': 'logo Genoa Cricket and Football Club.png',
            'Inter Milan': 'logo Inter Milan.png',
            'Juventus': 'logo Juventus Football Club.png',
            'Lecce': 'logo Lecce.png',
            'Naples': 'logo Napoli.png',
            'Parme': 'logo Parma Calcio 1913.png',
            'Sassuolo': 'logo Sassuolo.png',
            'Lazio Rome': 'logo Società Sportiva Lazio.png',
            'Torino FC': 'logo Torino.png',
            'Udinese': 'logo Udinese Calcio.png',
            'Venise FC': 'logo Venezia.png',
            // nouvelle équipe (logo fourni, pas encore en base) :
            'Frosinone': 'logo Frosinone Calcio.png',
            'Hellas Vérone': 'logo Hellas Verona Football Club.png'
        }
    }
};

async function run(){
    for(const [leagueName, { folder, crests }] of Object.entries(leagues)){
        const leagueResult = await pool.query('SELECT id FROM leagues WHERE name = $1', [leagueName]);
        if(leagueResult.rows.length === 0){
            console.error(`Championnat introuvable : ${leagueName}`);
            continue;
        }
        const leagueId = leagueResult.rows[0].id;

        let updated = 0;
        let created = 0;

        for(const [teamName, filename] of Object.entries(crests)){
            const crestUrl = `/Images/Logo Club/${folder}/${filename}`;

            const existing = await pool.query(
                'SELECT id FROM teams WHERE league_id = $1 AND name = $2',
                [leagueId, teamName]
            );

            let teamId;
            if(existing.rows.length > 0){
                teamId = existing.rows[0].id;
                await pool.query('UPDATE teams SET crest_url = $1 WHERE id = $2', [crestUrl, teamId]);
                updated++;
            } else {
                const inserted = await pool.query(
                    'INSERT INTO teams (league_id, name, crest_url) VALUES ($1, $2, $3) RETURNING id',
                    [leagueId, teamName, crestUrl]
                );
                teamId = inserted.rows[0].id;
                created++;
            }

            const jerseyExists = await pool.query(
                'SELECT id FROM products WHERE team_id = $1 AND season = $2 AND type = $3',
                [teamId, '2026/2027', 'Domicile']
            );
            if(jerseyExists.rows.length === 0){
                await pool.query(
                    `INSERT INTO products (name, price, image_url, team_id, season, type)
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [`Maillot ${teamName} domicile 2026/2027`, 40000, '/Images/maillot-placeholder.svg', teamId, '2026/2027', 'Domicile']
                );
            }
        }

        const missing = await pool.query(
            'SELECT name FROM teams WHERE league_id = $1 AND crest_url IS NULL ORDER BY name',
            [leagueId]
        );

        console.log(`\n${leagueName} : ${updated} logos mis à jour, ${created} nouvelles équipes créées.`);
        if(missing.rows.length > 0){
            console.log(`  Sans logo : ${missing.rows.map(r => r.name).join(', ')}`);
        } else {
            console.log('  Toutes les équipes ont un logo.');
        }
    }

    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
