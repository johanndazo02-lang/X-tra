// Crée un compte administrateur, ou donne / retire les droits à un compte existant.
// Utilisation :
//   node src/make-admin.js admin@exemple.com "Nom affiché"   -> crée le compte (mot de passe généré)
//   node src/make-admin.js admin@exemple.com --nouveau-mot-de-passe
//   node src/make-admin.js admin@exemple.com --retirer
require('dotenv').config();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const pool = require('./db');

const generatePassword = () => crypto.randomBytes(12).toString('base64url');

async function run(){
    const args = process.argv.slice(2);
    const email = (args[0] || '').trim().toLowerCase();
    const flags = args.filter(a => a.startsWith('--'));
    const name = args.slice(1).find(a => !a.startsWith('--')) || 'Administrateur';

    if(!email || !email.includes('@')){
        console.log('Utilisation : node src/make-admin.js <email> ["Nom"] [--nouveau-mot-de-passe | --retirer]');
        process.exit(0);
    }

    const existing = (await pool.query('SELECT id, name FROM users WHERE email = $1', [email])).rows[0];

    if(flags.includes('--retirer')){
        if(!existing){
            console.log(`Aucun compte trouvé pour ${email}.`);
        } else {
            await pool.query('UPDATE users SET is_admin = false WHERE id = $1', [existing.id]);
            console.log(`${existing.name} (${email}) : droits administrateur retirés.`);
        }
        await pool.end();
        return;
    }

    let password = null;
    if(!existing){
        password = generatePassword();
        await pool.query(
            'INSERT INTO users (name, email, password_hash, is_admin) VALUES ($1, $2, $3, true)',
            [name, email, await bcrypt.hash(password, 10)]
        );
        console.log(`Compte administrateur créé : ${name} (${email}).`);
    } else {
        await pool.query('UPDATE users SET is_admin = true WHERE id = $1', [existing.id]);
        console.log(`${existing.name} (${email}) est maintenant administrateur.`);
        if(flags.includes('--nouveau-mot-de-passe')){
            password = generatePassword();
            await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [await bcrypt.hash(password, 10), existing.id]);
        }
    }

    if(password){
        console.log(`Mot de passe : ${password}`);
        console.log('Notez-le maintenant : il ne sera plus affiché.');
    }

    await pool.end();
}

run().catch(err => {
    console.error(err);
    process.exit(1);
});
