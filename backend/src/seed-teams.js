require('dotenv').config();
const pool = require('./db');

const leagues = [
    {
        name: 'LaLiga',
        logo_url: '/Images/Logo 5Gs/liga.png',
        teams: [
            'Real Madrid', 'FC Barcelone', 'Atlético Madrid', 'Athletic Bilbao', 'Real Sociedad',
            'Real Betis', 'Villarreal', 'Valence', 'Séville FC', 'Girona',
            'Celta Vigo', 'Rayo Vallecano', 'Osasuna', 'Getafe', 'Majorque',
            'Deportivo Alavés', 'Las Palmas', 'Espanyol Barcelone', 'Leganés', 'Real Valladolid',
            'Levante'
        ]
    },
    {
        name: 'Ligue 1',
        logo_url: '/Images/Logo 5Gs/ligue 1.png',
        teams: [
            'Paris Saint-Germain', 'AS Monaco', 'Olympique de Marseille', 'Olympique Lyonnais', 'LOSC Lille',
            'OGC Nice', 'RC Lens', 'Stade Rennais', 'RC Strasbourg', 'Toulouse FC',
            'FC Nantes', 'Montpellier HSC', 'Stade Brestois', 'Le Havre AC', 'AJ Auxerre',
            'Angers SCO', 'AS Saint-Étienne', 'Stade de Reims'
        ]
    },
    {
        name: 'Premier League',
        logo_url: '/Images/Logo 5Gs/premier league.png',
        teams: [
            'Manchester City', 'Arsenal', 'Liverpool', 'Manchester United', 'Chelsea',
            'Tottenham Hotspur', 'Newcastle United', 'Aston Villa', 'Brighton & Hove Albion', 'West Ham United',
            'Crystal Palace', 'Fulham', 'Wolverhampton Wanderers', 'Everton', 'Brentford',
            'Nottingham Forest', 'Bournemouth', 'Leicester City', 'Ipswich Town', 'Southampton'
        ]
    },
    {
        name: 'Bundesliga',
        logo_url: '/Images/Logo 5Gs/buendeliga.png',
        teams: [
            'Bayern Munich', 'Bayer Leverkusen', 'RB Leipzig', 'Borussia Dortmund', 'Eintracht Francfort',
            'VfB Stuttgart', 'Borussia Mönchengladbach', 'SC Fribourg', 'Werder Brême', 'VfL Wolfsburg',
            'Mayence 05', 'Union Berlin', 'FC Augsbourg', 'TSG Hoffenheim', 'FC Heidenheim',
            'VfL Bochum', 'FC St. Pauli', 'Holstein Kiel'
        ]
    },
    {
        name: 'Serie A',
        logo_url: '/Images/Logo 5Gs/serie a.png',
        teams: [
            'Inter Milan', 'AC Milan', 'Juventus', 'Naples', 'AS Rome',
            'Lazio Rome', 'Atalanta Bergame', 'Fiorentina', 'Bologne', 'Torino FC',
            'Udinese', 'Sassuolo', 'Gênes CFC', 'Cagliari', 'Hellas Vérone',
            'Lecce', 'Parme', 'Côme 1907', 'Venise FC', 'AC Monza'
        ]
    }
];

async function seed(){
    for(const league of leagues){
        const leagueResult = await pool.query(
            `INSERT INTO leagues (name, logo_url) VALUES ($1, $2)
             ON CONFLICT (name) DO UPDATE SET logo_url = EXCLUDED.logo_url
             RETURNING id`,
            [league.name, league.logo_url]
        );
        const leagueId = leagueResult.rows[0].id;

        for(const teamName of league.teams){
            const existing = await pool.query(
                'SELECT id FROM teams WHERE league_id = $1 AND name = $2',
                [leagueId, teamName]
            );

            let teamId;
            if(existing.rows.length > 0){
                teamId = existing.rows[0].id;
            } else {
                const teamResult = await pool.query(
                    'INSERT INTO teams (league_id, name) VALUES ($1, $2) RETURNING id',
                    [leagueId, teamName]
                );
                teamId = teamResult.rows[0].id;
            }

            const jerseyExists = await pool.query(
                `SELECT id FROM products WHERE team_id = $1 AND season = $2 AND type = $3`,
                [teamId, '2026/2027', 'Domicile']
            );

            if(jerseyExists.rows.length === 0){
                await pool.query(
                    `INSERT INTO products (name, price, image_url, team_id, season, type, season_start_year)
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [
                        `Maillot ${teamName} domicile 2026/2027`,
                        40000,
                        '/Images/maillot-placeholder.svg',
                        teamId,
                        '2026/2027',
                        'Domicile',
                        2026
                    ]
                );
            }
        }
        console.log(`${league.name} : ${league.teams.length} équipes prêtes.`);
    }

    console.log('Championnats, équipes et maillots placeholder initialisés.');
    await pool.end();
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
