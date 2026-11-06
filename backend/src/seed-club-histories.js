// Frises équipementiers / sponsors et historique de plusieurs clubs.
// Les frises reprennent les captures fournies par l'utilisateur (octobre 2026),
// du plus récent au plus ancien. Les textes sont rédigés pour X-Tra à partir de
// faits publics connus, sans reprendre le texte d'un autre site.
// Utilisation : node src/seed-club-histories.js
require('dotenv').config();
const pool = require('./db');

const clubs = {
    'Atlético Madrid': {
        suppliers: [
            { name: 'Nike', period: 'depuis 2001' },
            { name: 'Reebok', period: '1998-2001' },
            { name: 'Puma', period: '1983-1998' },
            { name: 'Meyba / Puma', period: '1982-1983' },
            { name: 'Meyba', period: '1981-1982' },
            { name: 'Deportes Cóndor', period: '1980-1981' },
            { name: 'Deportes Cóndor', period: '1950-1980' },
            { name: 'In-House', period: "jusqu'à 1950" }
        ],
        sponsors: [
            { name: 'Riyadh Air', period: '2023-2033' },
            { name: 'WhaleFin', period: '2022-2023' },
            { name: 'Plus500', period: '2015-2022' },
            { name: 'Baku 2015', period: '2014-2015' },
            { name: 'Azerbaijan Land of Fire', period: '2012-2014' },
            { name: 'Huawei', period: '2012' },
            { name: 'Rixos Hotels', period: '2012' },
            { name: 'Pas de sponsor', period: '2011-2012' },
            { name: 'KIA', period: '2005-2011' },
            { name: 'Columbia Pictures', period: '2003-2005' },
            { name: 'Idea', period: '2000-2003' },
            { name: 'Pas de sponsor', period: '1999-2000' },
            { name: 'Marbella', period: '1997-1999' },
            { name: 'Bandai', period: '1996-1997' },
            { name: 'Marbella', period: '1994-1996' },
            { name: 'Antena 3', period: '1993-1994' },
            { name: 'Marbella', period: '1990-1993' },
            { name: 'Mita', period: '1987-1990' },
            { name: 'Pas de sponsor', period: "jusqu'à 1987" }
        ],
        history: "Fondé en 1903, l'Atlético de Madrid forme avec le Real Madrid et le FC Barcelone le trio des grands clubs espagnols. Ses joueurs sont surnommés les « Colchoneros », les matelassiers : leurs rayures rouges et blanches rappelaient la toile des matelas d'autrefois. Depuis 2017, le club joue au stade Metropolitano, à l'est de la capitale. La tenue domicile associe le maillot rayé rouge et blanc à un short bleu ; à l'extérieur, l'Atlético privilégie le plus souvent des teintes sombres, bleu marine ou noir. Équipé par Nike depuis 2001, après Puma, Reebok et Meyba, le club affiche Riyadh Air sur son maillot depuis 2023."
    },
    'Bayern Munich': {
        suppliers: [
            { name: 'adidas', period: 'depuis 1971' },
            { name: 'Palme', period: '1967-1971' },
            { name: 'Erima / Palme', period: '1966-1967' },
            { name: 'Erima', period: '1960-1966' },
            { name: 'In-House', period: '1955-1957' },
            { name: 'Sport-Munzinger', period: '1931-1951' },
            { name: 'In-House', period: "jusqu'à 1927" }
        ],
        sponsors: [
            { name: 'Deutsche Telekom', period: '2002-2027' },
            { name: 'Opel', period: '1989-2002' },
            { name: 'Commodore', period: '1984-1989' },
            { name: 'Iveco', period: '1981-1984' },
            { name: 'Magirus Deutz', period: '1978-1981' },
            { name: 'Adidas', period: '1974-1978' },
            { name: 'Pas de sponsor', period: "jusqu'à 1974" }
        ],
        history: "Fondé en 1900, le FC Bayern Munich est le club le plus titré d'Allemagne. Il dispute ses matchs depuis 2005 à l'Allianz Arena, dont la façade s'illumine les soirs de match. Ses couleurs sont le rouge et le blanc ; les maillots extérieurs alternent le plus souvent entre le blanc et des teintes sombres, noir ou marine. Adidas équipe le club depuis 1971, l'un des partenariats les plus longs du football européen, et le « T » de Deutsche Telekom orne le maillot depuis 2002. Chaque automne, le Bayern sort aussi un maillot spécial en l'honneur de l'Oktoberfest."
    },
    'Bayer Leverkusen': {
        suppliers: [
            { name: 'New Balance', period: 'depuis 2025' },
            { name: 'Castore', period: '2022-2025' },
            { name: 'Jako', period: '2016-2022' },
            { name: 'adidas', period: '1976-2016' },
            { name: 'In-House / adidas', period: '1975-1976' },
            { name: 'Unbranded', period: '1968-1975' },
            { name: 'In-House / Unbranded', period: '1967-1968' },
            { name: 'In-House', period: '1966-1967' },
            { name: 'Unbranded', period: '1965-1966' },
            { name: 'In-House / Unbranded', period: '1964-1965' },
            { name: 'Unbranded', period: '1908-1964' },
            { name: 'In-House', period: "jusqu'à 1908" }
        ],
        sponsors: [
            { name: 'Barmenia Versicherungen', period: '2016-2028' },
            { name: 'LG', period: '2013-2016' },
            { name: 'DKMS', period: '2013' },
            { name: 'SunPower', period: '2011-2013' },
            { name: 'TelDaFax ENERGY', period: '2007-2011' },
            { name: 'RWE', period: '2000-2007' },
            { name: 'Aspirin', period: '1997-2000' },
            { name: 'Alka-Seltzer', period: '1995-1997' },
            { name: 'Talcid', period: '1990-1995' },
            { name: 'Bayer', period: '1975-1990' },
            { name: 'Pas de sponsor', period: "jusqu'à 1975" }
        ],
        history: "Le Bayer 04 Leverkusen a été fondé en 1904 par des employés du groupe pharmaceutique Bayer, dont il porte toujours le nom et la croix sur son écusson. Il joue à la BayArena et a décroché en 2024 son premier titre de champion d'Allemagne, sans perdre un seul match de Bundesliga. Sa tenue domicile mêle le rouge et le noir sous de nombreuses formes, avec un short noir et des chaussettes rouges ; le maillot extérieur en inverse souvent les dominantes. New Balance équipe le club depuis 2025, après Castore, et l'assureur Barmenia est son sponsor maillot depuis 2016."
    },
    'AJ Auxerre': {
        suppliers: [
            { name: 'Macron', period: 'depuis 2017' },
            { name: 'Airness', period: '2007-2017' },
            { name: 'Uhlsport', period: '2004-2007' },
            { name: 'Kappa', period: '2001-2004' },
            { name: 'Uhlsport', period: '2000-2001' },
            { name: 'adidas', period: '1996-2000' },
            { name: 'Uhlsport', period: '1986-1996' },
            { name: 'Kappa', period: '1985-1986' },
            { name: 'Duarig', period: '1982-1985' },
            { name: 'Puma', period: '1980-1981' },
            { name: 'KoPa', period: "jusqu'à 1980" }
        ],
        sponsors: [
            { name: 'X1', period: 'depuis 2025' },
            { name: 'Acadomia', period: '2022-2025' },
            { name: 'Servistores', period: '2019-2022' },
            { name: 'Louault', period: '2014-2019' },
            { name: 'Maisons Pierre', period: '2011-2014' },
            { name: 'Senoble', period: '2009-2011' },
            { name: 'Nàsuba Express', period: '2008-2009' },
            // Noms tronqués sur la capture fournie : à compléter quand la source sera connue.
            { name: 'Airness Sports…', period: '2007-2008' },
            { name: 'Sony', period: '1998-2007' },
            { name: 'Fimagen', period: '1998-1999' },
            { name: 'Fimagest', period: '1996-1998' },
            { name: 'Duc de Bourgo…', period: '1993-1996' },
            { name: 'Commodore', period: '1991-1993' },
            { name: 'Duc de Bourgo…', period: '1990-1992' },
            { name: 'BSA', period: '1989-1990' },
            { name: 'Chaillotine', period: '1986-1989' },
            { name: 'Pas de sponsor', period: '1985-1986' },
            { name: 'Crédit Agricole', period: '1983-1985' },
            { name: 'Achichien', period: '1982-1983' },
            { name: 'Pas de sponsor', period: '1981-1982' },
            { name: "pic'grin", period: '1980-1981' },
            { name: 'Chaillotine', period: '1979-1980' },
            { name: 'Pas de sponsor', period: "jusqu'à 1979" }
        ],
        history: "Fondée en 1905, l'AJ Auxerre joue au stade de l'Abbé-Deschamps, sur les bords de l'Yonne. Son histoire est indissociable de Guy Roux, son entraîneur pendant plus de quarante ans, avec qui le club a réussi le doublé championnat–Coupe de France en 1996. La tenue traditionnelle associe un maillot blanc rehaussé de bleu, un short bleu et des chaussettes blanches ; les maillots extérieurs sont le plus souvent bleus ou noirs. Macron équipe le club depuis 2017."
    },
    'Angers SCO': {
        suppliers: [
            { name: 'Nike', period: 'depuis 2023' },
            { name: 'Kappa', period: '2013-2023' },
            { name: 'Umbro', period: '2010-2013' },
            { name: 'Lotto', period: '2007-2010' },
            { name: 'Hummel', period: '2005-2007' },
            { name: 'Errea', period: '2004-2005' },
            { name: 'Lotto', period: '1998-2004' },
            { name: 'adidas', period: '1995-1997' },
            { name: 'ABM', period: '1994-1995' },
            { name: 'Duarig', period: '1991-1994' },
            { name: 'adidas', period: '1990-1991' },
            { name: "C'drik Sports", period: '1987-1990' },
            { name: 'In-House', period: '1986-1987' },
            { name: 'adidas', period: '1975-1982' },
            { name: 'Le Coq Sportif', period: '1969-1970' },
            { name: 'In-House', period: "jusqu'à 1967" }
        ],
        // Pas de capture des sponsors fournie pour Angers : l'onglet reste masqué.
        sponsors: null,
        history: "Fondé en 1919, Angers SCO (Sporting Club de l'Ouest) dispute ses matchs au stade Raymond-Kopa, rebaptisé en 2017 en hommage à l'ancien Ballon d'or, passé par le club au début de sa carrière. Son maillot arbore traditionnellement le noir et le blanc, le plus souvent sous forme de rayures verticales. Nike équipe le club depuis 2023, après dix saisons avec Kappa."
    }
};

async function run(){
    for(const [teamName, club] of Object.entries(clubs)){
        const result = await pool.query(
            'UPDATE teams SET history = $1, suppliers = $2, sponsors = $3 WHERE name = $4 RETURNING id',
            [
                club.history,
                club.suppliers ? JSON.stringify(club.suppliers) : null,
                club.sponsors ? JSON.stringify(club.sponsors) : null,
                teamName
            ]
        );
        if(result.rows.length === 0){
            console.error(`Équipe introuvable : ${teamName}`);
            continue;
        }
        console.log(`${teamName} : ${club.suppliers ? club.suppliers.length : 0} équipementiers, ${club.sponsors ? club.sponsors.length : 0} sponsors.`);
    }
    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
