require('dotenv').config();
const pool = require('./db');

const TEAM_NAME = 'Athletic Bilbao';

// Chronologie des équipementiers et sponsors maillot (ordre du plus récent
// au plus ancien, tel qu'il apparaît sur les sites d'archives de maillots).
const suppliers = [
    { name: 'Castore', period: 'depuis 2023' },
    { name: 'New Balance', period: '2017-2023' },
    { name: 'Nike', period: '2013-2017' },
    { name: 'Umbro', period: '2009-2013' },
    { name: '%100 Athletic', period: '2001-2009' },
    { name: 'adidas', period: '1999-2001' },
    { name: 'Kappa', period: '1991-1999' },
    { name: 'adidas', period: '1980-1991' },
    { name: 'Deportes Cóndor', period: '1965-1980' },
    { name: 'In-House', period: "jusqu'à 1962" }
];

const sponsors = [
    { name: 'Kutxabank', period: 'depuis 2015' },
    { name: 'BBK', period: '2014-2015' },
    { name: 'Petronor', period: '2008-2015' },
    { name: 'Pas de sponsor', period: "jusqu'à 2008" }
];

// Texte rédigé pour X-Tra à partir de faits publics connus (à ne pas
// confondre avec le texte d'un autre site) : fondation, politique de
// recrutement basque, identité du maillot.
const history = "Fondé en 1898, l'Athletic Club de Bilbao est l'un des clubs les plus singuliers du football européen : il ne fait jouer que des footballeurs formés au Pays basque ou d'origine basque, une politique connue sous le nom de « cantera » qu'il applique sans exception depuis sa création. Sa tenue emblématique — maillot rayé rouge et blanc, short noir, chaussettes noires — n'a quasiment pas changé depuis le début du XXe siècle, ce qui en fait l'un des kits les plus reconnaissables d'Espagne. À l'extérieur, le club a porté au fil des saisons des tenues noires, vertes ou bleues selon les époques. Avec le Real Madrid et le FC Barcelone, l'Athletic est l'un des trois seuls clubs à n'avoir jamais été relégué de LaLiga depuis la création du championnat.";

async function run(){
    const result = await pool.query(
        'UPDATE teams SET history = $1, suppliers = $2, sponsors = $3 WHERE name = $4 RETURNING id',
        [history, JSON.stringify(suppliers), JSON.stringify(sponsors), TEAM_NAME]
    );

    if(result.rows.length === 0){
        console.error(`Équipe introuvable : ${TEAM_NAME}`);
        process.exit(1);
    }

    console.log(`Historique, fournisseurs et sponsors enregistrés pour ${TEAM_NAME}.`);
    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
