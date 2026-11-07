// Frises équipementiers / sponsors et historique des clubs LaLiga (hors Athletic Bilbao
// et Atlético Madrid, déjà dans leurs propres seeds).
// Les frises reprennent les captures fournies par l'utilisateur (dossiers
// Images/Maillots/Liga/<Club>/histoire, novembre 2026), du plus récent au plus ancien.
// Un nom tronqué sur la capture et impossible à compléter avec certitude garde « … ».
// Les textes sont rédigés pour X-Tra à partir de faits publics connus, sans reprendre
// le texte d'un autre site.
// Utilisation : node src/seed-liga-histories.js
require('dotenv').config();
const pool = require('./db');

const S = (name, period) => ({ name, period });

const clubs = {
    'Celta Vigo': {
        suppliers: [
            S('Hummel', 'depuis 2024'), S('adidas', '2013-2024'), S('Li-Ning', '2010-2013'),
            S('Umbro', '1986-2010'), S('adidas', '1982-1986'), S('Inconnu', '1981-1982'),
            S('In-House', '1976-1981'), S('In-House / Mon…', '1975-1976'), S('In-House', "jusqu'à 1975")
        ],
        sponsors: [
            S('Estrella Galicia', 'depuis 2016'), S('Citroën', '1986-2016'), S('Pas de sponsor', "jusqu'à 1986")
        ],
        history: "Fondé en 1923 à Vigo, en Galice, le Real Club Celta de Vigo est le grand club de la côte atlantique espagnole. Il joue au stade de Balaídos, face à l'estuaire. Ses couleurs sont le bleu ciel et le blanc : le maillot domicile est bleu ciel, souvent avec des détails blancs, tandis que la tenue extérieure change d'une saison à l'autre. Le club a vu passer des joueurs marquants comme Alexander Mostovoi ou Iago Aspas, enfant du pays. Équipé par Hummel depuis 2024, après adidas, Li-Ning et Umbro, le Celta affiche Estrella Galicia sur son maillot depuis 2016, après trente ans de partenariat avec Citroën."
    },
    'Espanyol Barcelone': {
        suppliers: [
            S('Kelme', 'depuis 2018'), S('Joma', '2015-2018'), S('Puma', '2012-2015'), S('Li-Ning', '2010-2012'),
            S('Uhlsport', '2006-2010'), S('Umbro', '2002-2006'), S('John Smith', '1999-2002'), S('Puma', '1994-1999'),
            S('Massana', '1984-1994'), S('Meyba', '1980-1984'), S('Mont-halt', '1975-1980'),
            S('Sans marque', '1929-1973'), S('In-House', '1928-1929'), S('Sans marque', "jusqu'à 1923")
        ],
        sponsors: [
            S('Arctempus', 'depuis 2026'), S('Dani', '2024-2026'), S('Riviera Maya', '2021-2024'), S('Betway', '2020-2021'),
            S('LD Sports', '2019-2020'), S('Riviera Maya', '2018-2019'), S('Rastar Toys', '2016-2018'), S('Power8', '2014-2016'),
            S('Cancun', '2011-2014'), S('Interwetten', '2008-2011'), S('Quat', '2006-2008'), S('Grup Tarradella…', '2004-2006'),
            S('Pas de sponsor', '2002-2004'), S('Futvol.com', '2000-2002'), S('Dani', '1994-2000'), S('Drogas, No', '1993-1994'),
            S('Pas de sponsor', '1990-1993'), S('Araña', '1989-1990'), S('Pas de sponsor', "jusqu'à 1989")
        ],
        history: "Fondé en 1900, le RCD Espanyol est l'un des plus anciens clubs d'Espagne et le second grand club de Barcelone. Il joue au stade RCDE, à Cornellà de Llobregat, dans la banlieue de la ville. Son maillot à bandes verticales bleues et blanches est l'un des plus reconnaissables de la Liga. Le « derbi barceloní » face au FC Barcelone est le rendez-vous le plus attendu de ses supporters. Vainqueur de la Copa del Rey à plusieurs reprises, l'Espanyol a aussi disputé la finale de la Coupe UEFA 2007, perdue aux tirs au but contre le Séville FC. Le club est équipé par Kelme depuis 2018."
    },
    'FC Barcelone': {
        suppliers: [
            S('Nike', 'depuis 1998'), S('Kappa', '1992-1998'), S('Meyba', '1980-1992'),
            S('Meyba / Mont-halt', '1979-1980'), S('Mont-halt', '1965-1979'), S('In-House', "jusqu'à 1963")
        ],
        sponsors: [
            S('Spotify', 'depuis 2022'), S('Rakuten', '2017-2022'), S('Qatar Airways', '2013-2017'),
            S('Qatar Foundation', '2011-2013'), S('Unicef', '2006-2011'), S('Pas de sponsor', "jusqu'à 2006")
        ],
        history: "Fondé en 1899 par le Suisse Joan Gamper, le FC Barcelone est l'un des clubs les plus titrés au monde et un symbole de la Catalogne. Ses joueurs portent depuis l'origine le bleu et le grenat, le fameux « blaugrana » ; selon la tradition, ces couleurs viendraient du FC Bâle, le club que Gamper avait connu en Suisse. Le Barça joue au Camp Nou, l'un des plus grands stades d'Europe. Longtemps, son maillot est resté sans sponsor : la première inscription, en 2006, fut celle de l'Unicef, que le club soutenait financièrement. Équipé par Nike depuis 1998, le Barça affiche Spotify depuis 2022."
    },
    'Getafe': {
        suppliers: [
            S('Joma', 'depuis 2004'), S('Brokal', '2002-2004'), S('Joma', '1999-2002'), S('Bemiser', '1997-1999'),
            S('Joma', '1994-1996'), S('Lotto', '1992-1994'), S('Umbro', "jusqu'à 1991")
        ],
        sponsors: [
            S('Tecnocasa', 'depuis 2014'), S('Confremar', '2013-2014'), S('Pas de sponsor', '2012-2013'), S('Burger King', '2009-2012'),
            S('Grupo Galcó', '2006-2009'), S('PSG', '2005-2006'), S('Opción', '2003-2005'), S('Sacresa', '2002-2003'),
            S('Lujisa', '2001-2002'), S('Visel Puertas', '1999-2001'), S('Pas de sponsor', '1995-1999'),
            S('Herba S.A.', '1992-1995'), S('Pas de sponsor', "jusqu'à 1992")
        ],
        history: "Le Getafe CF représente la ville de Getafe, au sud de Madrid, et joue au Coliseum, qui porte le nom de l'ancien joueur Alfonso Pérez. Club modeste face aux géants de la capitale, il s'est installé durablement en Liga au XXIᵉ siècle grâce à un jeu combatif et discipliné. Son maillot domicile est bleu, souvent accompagné de blanc. Équipé par Joma presque sans interruption depuis le milieu des années 1990, le club affiche Tecnocasa sur son maillot depuis 2014."
    },
    'Levante': {
        suppliers: [
            S('Macron', 'depuis 2016'), S('Nike', '2014-2016'), S('Kelme', '2012-2014'), S('Luanvi', '2004-2012'),
            S('Xara', '2003-2004'), S('Umbro', '2000-2003'), S('Joma', '1998-2000'), S('Rasan', '1991-1998'),
            S('Flower', '1988-1991'), S('Santillana Track', '1987-1988'), S('Ressy / Yama', '1986-1987'), S('Ressy', '1979-1986'),
            S('In-House', '1977-1979'), S('Mont-halt', '1975-1976'), S('In-House', "jusqu'à 1973")
        ],
        sponsors: [
            S('Sesame HR', 'depuis 2026'), S('Marcos Autom…', '2022-2026'), S('Gedesco', '2021-2022'), S('Betway', '2018-2021'),
            S('Jawwy', '2017-2018'), S('East United', '2014-2017'), S('Comunitat Valenciana', '2006-2014'), S('Ciudad de las A…', '2005-2006'),
            S('MVA Seguros', '2004-2005'), S('Terra Mítica', '1998-2004'), S('Air Nostrum', '1997-1998'), S('LIDER', '1996-1997'),
            S('TOP Recambios', '1995-1996'), S('LIDER', '1994-1995'), S('Pas de sponsor', '1993-1994'), S('COFISER', '1992-1993'),
            S('Puerto Valencia', '1991-1992'), S('Caja Rural de V…', '1988-1991'), S('Pas de sponsor', '1987-1988'),
            S('Caja Ahorros V…', '1985-1987'), S('Ferrys', '1983-1985'), S('Pas de sponsor', "jusqu'à 1983")
        ],
        history: "Fondé en 1909, le Levante UD est le plus ancien club de la ville de Valence. Il joue au stade Ciutat de València, près du quartier maritime où il est né. Ses joueurs portent un maillot à bandes verticales bleues et rouges, d'où leur surnom de « granotes », les grenouilles, en référence aux anciens marais voisins. Longtemps éloigné de l'élite, le club a retrouvé la Liga au XXIᵉ siècle et y a connu ses plus belles saisons. Équipé par Macron depuis 2016, le Levante affiche Sesame HR sur son maillot depuis 2026."
    },
    'Osasuna': {
        suppliers: [
            S('Macron', 'depuis 2024'), S('adidas', '2020-2024'), S('Hummel', '2018-2020'), S('adidas', '2013-2018'),
            S('Astore', '2010-2013'), S('Diadora', '2008-2010'), S('Astore', '1998-2008'), S('Kappa', '1995-1998'),
            S('Line 7', '1990-1995'), S('Umbro', '1987-1990'), S('Ressy', '1986-1987'), S('Meyba', '1983-1986'),
            S('Mont-halt', '1982-1983'), S('adidas', '1979-1982'), S('In-House', "jusqu'à 1979")
        ],
        sponsors: [
            S('Kosner', '2023-2030'), S('Verleal', '2020-2023'), S('Kirolbet', '2018-2020'), S('Pas de sponsor', '2016-2018'),
            S('Lacturale', '2012-2016'), S('Pas de sponsor', '2010-2012'), S('Yingli Solar', '2008-2010'), S('Restaura', '2006-2008'),
            S('Caja Navarra', '2002-2006'), S('Señorío de Sarría', '2001-2002'), S('Caja Navarra', '1995-2001'),
            S('Diario de Noticias', '1994-1995'), S('Huarte', '1990-1994'), S('Rosado de Nav…', '1987-1990'),
            S('Pas de sponsor', "jusqu'à 1987")
        ],
        history: "Fondé en 1920 à Pampelune, le Club Atlético Osasuna est le club de la Navarre ; son nom signifie « santé » en basque. Il joue au stade El Sadar, réputé pour son ambiance bouillante. Sa tenue est rouge, avec un short bleu marine. Osasuna a vécu sa plus belle aventure européenne en 2007, en atteignant les demi-finales de la Coupe UEFA. Équipé par Macron depuis 2024, après adidas, Hummel et Astore, le club affiche Kosner sur son maillot depuis 2023."
    },
    'Rayo Vallecano': {
        suppliers: [
            S('Umbro', 'depuis 2020'), S('Kelme', '2015-2020'), S('Errea', '2012-2015'), S('Royal Sport', '2011-2012'),
            S('Patrick', '2007-2011'), S('Jhayber', '2005-2007'), S('Joma', '1994-2005'), S('Lotto', '1991-1994'),
            S('Rasan', '1989-1991'), S('Puma', '1986-1989'), S('adidas', '1982-1983'), S('Meyba', '1980-1981'),
            S('adidas', '1977-1980'), S('In-House', "jusqu'à 1976")
        ],
        sponsors: [
            S('DIGI', 'depuis 2020'), S('Pas de sponsor', '2018-2020'), S('Bufete Rosales', '2017-2018'), S('Pas de sponsor', '2016-2017'),
            S('Qbao.com', '2014-2016'), S('Pas de sponsor', '2011-2014'), S('Clesa', '2007-2011'), S('Dhul', '2006-2007'),
            S('Elgorriaga', '2005-2006'), S('Nueva Rumasa', '1999-2005'), S('Trapa', '1997-1999'), S('Estepona', '1996-1997'),
            S('Estepona', '1995-1996'), S('Dhul', '1994-1995'), S('MMT Seguros', '1993-1994'), S('Ciripolen', '1992-1993'),
            S('Hispagres', '1991-1992'), S('Pas de sponsor', '1990-1991'), S('Mercasa', '1989-1990'), S('Pas de sponsor', '1988-1989'),
            S('Repuestos Men…', '1987-1988'), S('Alcampo', '1984-1987'), S('Pas de sponsor', "jusqu'à 1984")
        ],
        history: "Fondé en 1924 dans le quartier populaire de Vallecas, à Madrid, le Rayo Vallecano est un club de quartier très attaché à ses racines. Il joue à l'Estadio de Vallecas, l'un des plus petits stades de la Liga. Son maillot blanc barré d'une bande rouge en diagonale, la « franja », est l'un des plus reconnaissables d'Espagne. En 2001, le Rayo a atteint les quarts de finale de la Coupe UEFA. Équipé par Umbro depuis 2020, le club affiche DIGI sur son maillot depuis la même année."
    },
    'Real Betis': {
        suppliers: [
            S('Hummel', 'depuis 2022'), S('Kappa', '2018-2022'), S('adidas', '2015-2018'), S('Macron', '2012-2015'),
            S('RBB', '2009-2012'), S('Kappa', '1995-2009'), S('Umbro', '1994-1995'), S('Frontrunner', '1991-1994'),
            S('Joma', '1990-1991'), S('Hummel', '1987-1990'), S('Meyba', '1980-1987'), S('In-House', '1977-1978'),
            S('Mont-halt', '1973-1975'), S('In-House', "jusqu'à 1973")
        ],
        sponsors: [
            S('Gree', 'depuis 2024'), S('Finetwork', '2021-2024'), S('Betway', '2020-2021'), S('easyMarkets', '2019-2020'),
            S('Pas de sponsor', '2016-2019'), S('UED Sports', '2015-2016'), S('Pas de sponsor', '2013-2015'), S('Heliópolis', '2012-2013'),
            S('Cirsa', '2011-2013'), S('Cajasol', '2010-2011'), S('Visit Andalucia', '2010-2011'), S('Pas de sponsor', '2009-2010'),
            S('Visit Andalucia', '2008-2009'), S('Garmin', '2007-2008'), S('Visit Andalucia', '2003-2007'), S('Globet.com', '2004-2006'),
            S('Pas de sponsor', '2000-2004'), S('Visit Andalucia', '1999-2000'), S('Pas de sponsor', '1998-1999'), S('Ocaroil', '1996-1998'),
            S('Kelia', '1995-1996'), S('Pas de sponsor', '1994-1995'), S('Incecosa', '1993-1994'), S('Pas de sponsor', '1990-1993'),
            S('Pepsi', '1989-1990'), S("Seville Expo '92", '1988-1989'), S('Pas de sponsor', "jusqu'à 1988")
        ],
        history: "Fondé en 1907 à Séville, le Real Betis Balompié est l'un des deux grands clubs de la capitale andalouse, rival historique du Séville FC. Il joue au stade Benito Villamarín, l'un des plus grands d'Espagne. Son maillot à rayures vertes et blanches est indissociable du club ; à l'extérieur, le Betis porte le plus souvent du bleu, du noir ou du vert. Champion d'Espagne en 1935, le club a aussi remporté la Copa del Rey à plusieurs reprises. Équipé par Hummel depuis 2022, après Kappa, adidas et Macron, le Betis affiche Gree sur son maillot depuis 2024."
    },
    'Real Madrid': {
        suppliers: [
            S('adidas', 'depuis 1998'), S('Kelme', '1994-1998'), S('Hummel', '1986-1994'), S('adidas', '1981-1986'),
            S('Mont-halt / adidas', '1980-1981'), S('Mont-halt', '1971-1980'), S('Umbro', '1965-1971'), S('Mont-halt', '1960-1965'),
            S('In-House', '1950-1960'), S('In-House', '1945-1946'), S('In-House', "jusqu'à 1942")
        ],
        sponsors: [
            S('Emirates', '2013-2031'), S('bwin', '2007-2013'), S('Siemens', '2002-2007'), S('Realmadrid.com', '2001-2002'),
            S('Teka', '1992-2001'), S('Otaysa', '1991-1992'), S('Reny Picot', '1989-1991'), S('Parmalat', '1985-1989'),
            S('Zanussi', '1982-1985'), S('Pas de sponsor', "jusqu'à 1982")
        ],
        history: "Fondé en 1902, le Real Madrid est le club le plus titré de l'histoire de la Ligue des champions et l'un des plus célèbres au monde. Il joue au stade Santiago Bernabéu, au cœur de la capitale espagnole. Depuis sa création, le club porte un maillot entièrement blanc, d'où le surnom de « Merengues » ; à l'extérieur, il a longtemps privilégié le violet ou le bleu marine, avant d'oser le noir, le gris ou le rose. Équipé par adidas depuis 1998, après Kelme et Hummel, le Real affiche Emirates sur son maillot depuis 2013."
    },
    'Séville FC': {
        suppliers: [
            S('adidas', 'depuis 2025'), S('Castore', '2022-2025'), S('Nike', '2018-2022'), S('New Balance', '2015-2018'),
            S('Warrior', '2013-2015'), S('Umbro', '2012-2013'), S('Li-Ning', '2011-2012'), S('Joma', '2001-2011'),
            S('Umbro', '1994-2001'), S('Hot Shot', '1993-1994'), S('Frontrunner', '1992-1993'), S('Bukta', '1990-1992'),
            S('Puma', '1987-1990'), S('Gilcor', '1986-1987'), S('Yama', '1983-1986'), S('adidas', '1979-1983'),
            S('Mont-halt', '1974-1979'), S('In-House', '1972-1973'), S('Sans marque', '1968-1969'), S('In-House', '1927-1964'),
            S('Sans marque', '1922'), S('In-House', "jusqu'à 1921")
        ],
        sponsors: [
            S('Midea', '2024-2026'), S('Pas de sponsor', '2023-2024'), S('Degiro', '2022-2023'), S('NAGA', '2021-2022'),
            S('Marathonbet', '2019-2021'), S('Playtika', '2017-2019'), S('See Puerto Rico', '2016-2017'), S('Pas de sponsor', '2015-2016'),
            S('Visit Malaysia', '2014-2015'), S('Pas de sponsor', '2013-2014'), S('Interwetten', '2012-2013'), S('Pas de sponsor', '2011-2012'),
            S('12bet', '2009-2011'), S('888', '2006-2009'), S('Stevenson', '2005-2006'), S('La Gitana', '2004-2005'),
            S('Pas de sponsor', '2003-2004'), S('OID', '2002-2003'), S('Visit Andalucia', '2001-2002'), S('Eurotex Pinturas', '1998-2001'),
            S('SuperCable', '1998-2000'), S('Pas de sponsor', '1996-1998'), S('Marbella', '1994-1996'), S('Pas de sponsor', '1993-1994'),
            S('Super NES', '1992-1993'), S('Pas de sponsor', '1990-1992'), S("Seville Expo '92", '1986-1990'),
            S('Pas de sponsor', "jusqu'à 1986")
        ],
        history: "Fondé en 1890, le Séville FC est l'un des plus anciens clubs d'Espagne. Il joue au stade Ramón Sánchez-Pizjuán, dans le quartier de Nervión, et dispute avec le Real Betis l'un des derbys les plus passionnés du pays. Sa tenue domicile est blanche avec des touches rouges ; à l'extérieur, les couleurs s'inversent le plus souvent. Le club détient le record de victoires en Coupe UEFA / Europa League, une compétition qu'il a remportée à sept reprises. Équipé par adidas depuis 2025, après Castore, Nike et New Balance, le club a affiché Midea sur son maillot à partir de 2024."
    },
    'Valence': {
        suppliers: [
            S('Puma', 'depuis 2019'), S('adidas', '2014-2019'), S('Joma', '2011-2014'), S('Kappa', '2009-2011'),
            S('Nike', '2000-2009'), S('Luanvi', '1993-2000'), S('Puma', '1990-1993'), S('Rasan', '1987-1990'),
            S('Ressy', '1981-1987'), S('adidas', '1980-1981'), S('Ressy', '1978-1980'), S('Mont-halt', '1969-1977'),
            S('In-House', '1956-1967'), S('Inconnu', '1955-1956'), S('In-House', "jusqu'à 1954")
        ],
        sponsors: [
            S('TM Grupo Inmobiliario', 'depuis 2023'), S('Cazoo', '2022-2023'), S('Socios.com', '2021-2022'), S('bwin', '2019-2021'),
            S('Blu Products', '2017-2019'), S('Pas de sponsor', '2014-2017'), S('Jinko Solar', '2011-2014'), S('Unibet', '2009-2011'),
            S('Valencia Experi…', '2008-2009'), S('Toyota', '2003-2008'), S('Terra Mítica', '2002-2003'), S('Metrored', '2001-2002'),
            S('Terra Mítica', '1998-2001'), S('Ford', '1995-1998'), S('Cooperativa In…', '1994-1995'),
            S('Generalitat Valenciana', '1992-1994'), S('Bancaixa', '1987-1992'), S('Pas de sponsor', "jusqu'à 1987")
        ],
        history: "Fondé en 1919, le Valencia CF joue au stade de Mestalla, l'un des plus anciens et des plus pentus d'Espagne. Son maillot domicile est blanc, porté avec un short noir, et son écusson est surmonté de la chauve-souris, symbole de la ville. Six fois champion d'Espagne, le club a vécu son âge d'or au début des années 2000 avec deux finales consécutives de Ligue des champions, puis une victoire en Coupe UEFA en 2004. Équipé par Puma depuis 2019, Valence affiche TM Grupo Inmobiliario sur son maillot depuis 2023."
    },
    'Villarreal': {
        suppliers: [
            S('Joma', 'depuis 2016'), S('Xtep', '2011-2016'), S('Puma', '2005-2011'), S('Kelme', '1999-2005'),
            S('Luanvi', '1997-1999'), S('Rasan', '1994-1997'), S('Jugui', '1993-1994'), S('Lotto', '1992-1993'),
            S('Rasan', '1988-1992'), S('Ressy', '1985-1986'), S('In-House', '1969-1970'), S('Sans marque', "jusqu'à 1952")
        ],
        sponsors: [
            S('Pamesa Cerámica', 'depuis 2013'), S('Pas de sponsor', '2011-2013'), S('Aeroport Castelló', '2004-2011'),
            S('Terra Mítica', '1998-2004'), S('Costa Azahar', '1995-1998'), S('Pas de sponsor', '1993-1995'),
            S('Caja Rural Villa…', '1991-1993'), S('Servilletas Cari…', '1990-1991'), S('Cerámicas Villa…', '1987-1990'),
            S('Pas de sponsor', '1986-1987'), S('Porcelanosa', '1985-1986'), S('Pas de sponsor', "jusqu'à 1985")
        ],
        history: "Fondé en 1923 à Vila-real, petite ville de la province de Castellón, le Villarreal CF n'a découvert la Liga qu'à la fin des années 1990. Il s'y est imposé depuis comme l'un des clubs les plus réguliers d'Espagne. Surnommé le « sous-marin jaune », il joue en jaune au stade de la Cerámica, nom qui rappelle l'industrie de la céramique, moteur économique de la région. Le club a remporté l'Europa League en 2021 face à Manchester United. Équipé par Joma depuis 2016, Villarreal affiche Pamesa Cerámica sur son maillot depuis 2013."
    }
};

async function run(){
    for(const [teamName, club] of Object.entries(clubs)){
        const result = await pool.query(
            'UPDATE teams SET history = $1, suppliers = $2, sponsors = $3 WHERE name = $4 RETURNING id',
            [club.history, JSON.stringify(club.suppliers), JSON.stringify(club.sponsors), teamName]
        );
        if(result.rows.length === 0){
            console.error(`Équipe introuvable : ${teamName}`);
            continue;
        }
        console.log(`${teamName} : ${club.suppliers.length} équipementiers, ${club.sponsors.length} sponsors.`);
    }
    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
