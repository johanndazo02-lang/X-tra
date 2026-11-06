require('dotenv').config();
const pool = require('./db');

// Années de fondation (faits historiques connus, réutilisables sans risque
// de désinformation — contrairement au design précis de chaque maillot par
// saison, que nous ne connaissons pas pour la plupart de ces clubs).
//
const founded = {
    'LaLiga': {
        'Real Madrid': 1902, 'FC Barcelone': 1899, 'Atlético Madrid': 1903, 'Athletic Bilbao': 1898,
        'Real Sociedad': 1909, 'Real Betis': 1907, 'Villarreal': 1923, 'Séville FC': 1890,
        'Girona': 1930, 'Celta Vigo': 1923, 'Rayo Vallecano': 1924, 'Osasuna': 1920,
        'Getafe': 1946, 'Majorque': 1916, 'Deportivo Alavés': 1921, 'Las Palmas': 1949,
        'Espanyol Barcelone': 1900, 'Leganés': 1928, 'Real Valladolid': 1928, 'Valence': 1919,
        'Levante': 1909, 'Malaga': 1904
    },
    'Bundesliga': {
        'Bayern Munich': 1900, 'Bayer Leverkusen': 1904, 'RB Leipzig': 2009, 'Borussia Dortmund': 1909,
        'Eintracht Francfort': 1899, 'VfB Stuttgart': 1893, 'Borussia Mönchengladbach': 1900, 'SC Fribourg': 1904,
        'Werder Brême': 1899, 'Mayence 05': 1905, 'Union Berlin': 1966, 'FC Augsbourg': 1907,
        'TSG Hoffenheim': 1899, 'SV Elversberg': 1907, 'FC Cologne': 1948, 'Schalke 04': 1904,
        'Hambourg SV': 1887, 'SC Paderborn': 1907, 'VfL Wolfsburg': 1945, 'FC Heidenheim': 1846,
        'VfL Bochum': 1848, 'FC St. Pauli': 1910, 'Holstein Kiel': 1900
    },
    'Premier League': {
        'Arsenal': 1886, 'Aston Villa': 1874, 'Bournemouth': 1899, 'Brentford': 1889,
        'Brighton & Hove Albion': 1901, 'Chelsea': 1905, 'Crystal Palace': 1905, 'Everton': 1878,
        'Fulham': 1879, 'Ipswich Town': 1878, 'Liverpool': 1892, 'Manchester City': 1880,
        'Manchester United': 1878, 'Newcastle United': 1892, 'Nottingham Forest': 1865, 'Tottenham Hotspur': 1882,
        'Coventry City': 1883, 'Hull City': 1904, 'Leeds United': 1919, 'Sunderland': 1879,
        'Leicester City': 1884, 'Southampton': 1885, 'West Ham United': 1895, 'Wolverhampton Wanderers': 1877
    },
    'Ligue 1': {
        'AS Monaco': 1924, 'Angers SCO': 1919, 'AJ Auxerre': 1905, 'LOSC Lille': 1944,
        'Le Havre AC': 1872, 'OGC Nice': 1904, 'Olympique Lyonnais': 1950, 'Olympique de Marseille': 1899,
        'Paris Saint-Germain': 1970, 'RC Lens': 1906, 'RC Strasbourg': 1906, 'Stade Brestois': 1950,
        'Stade Rennais': 1901, 'Toulouse FC': 1970, 'Troyes': 1986, 'FC Lorient': 1926,
        'Le Mans FC': 1902, 'Paris FC': 1969, 'AS Saint-Étienne': 1933, 'FC Nantes': 1943,
        'Montpellier HSC': 1919, 'Stade de Reims': 1931
    },
    'Serie A': {
        'Fiorentina': 1926, 'AC Milan': 1899, 'AC Monza': 1912, 'AS Rome': 1927,
        'Atalanta Bergame': 1907, 'Bologne': 1909, 'Cagliari': 1920, 'Côme 1907': 1907,
        'Gênes CFC': 1893, 'Inter Milan': 1908, 'Juventus': 1897, 'Lecce': 1908,
        'Naples': 1926, 'Parme': 1913, 'Sassuolo': 1920, 'Lazio Rome': 1900,
        'Torino FC': 1906, 'Udinese': 1896, 'Venise FC': 1907, 'Frosinone': 1928,
        'Hellas Vérone': 1903
    }
};

async function run(){
    for(const [leagueName, teams] of Object.entries(founded)){
        const leagueResult = await pool.query('SELECT id FROM leagues WHERE name = $1', [leagueName]);
        if(leagueResult.rows.length === 0) continue;
        const leagueId = leagueResult.rows[0].id;

        let updated = 0;
        for(const [teamName, year] of Object.entries(teams)){
            const teamResult = await pool.query(
                'UPDATE teams SET founded_year = $1 WHERE league_id = $2 AND name = $3 RETURNING id',
                [year, leagueId, teamName]
            );
            if(teamResult.rows.length === 0){
                console.warn(`Équipe introuvable (${leagueName}) : ${teamName}`);
                continue;
            }
            updated++;

            // Le catalogue ne garde que les saisons récentes : on retire les
            // anciennes fiches « Archive historique » si elles existent encore.
            await pool.query(
                "DELETE FROM products WHERE team_id = $1 AND type = 'Archive historique'",
                [teamResult.rows[0].id]
            );
        }
        console.log(`${leagueName} : ${updated} années de fondation mises à jour.`);
    }

    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
