// Enregistrement des images envoyées en base64 (photos produits, photos de profil).
// Le type est déterminé par le contenu du fichier, jamais par son nom.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const IMAGES_ROOT = path.join(__dirname, '..', '..', 'Images');
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const IMAGE_SIGNATURES = [
    { ext: 'jpg', check: (b) => b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF },
    { ext: 'png', check: (b) => b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) },
    { ext: 'webp', check: (b) => b.slice(0, 4).toString() === 'RIFF' && b.slice(8, 12).toString() === 'WEBP' }
];

class UploadError extends Error {}

const slugify = (name) => (name || 'image').toString()
    .replace(/\.[^.]+$/, '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
    .slice(0, 60) || 'image';

// folder : sous-dossier de /Images (ex. 'Uploads', 'Avatars'). Renvoie l'URL publique.
const saveImage = (dataUrl, filename, folder) => {
    const data = (dataUrl || '').toString().replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(data, 'base64');
    if(buffer.length === 0) throw new UploadError('Aucune image reçue.');
    if(buffer.length > MAX_UPLOAD_BYTES) throw new UploadError('Image trop lourde (5 Mo maximum).');

    const kind = IMAGE_SIGNATURES.find(s => s.check(buffer));
    if(!kind) throw new UploadError('Format non accepté (JPEG, PNG ou WebP).');

    const fileName = `${slugify(filename)}-${crypto.randomBytes(4).toString('hex')}.${kind.ext}`;
    const dir = path.join(IMAGES_ROOT, folder);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, fileName), buffer);
    return `/Images/${folder}/${fileName}`;
};

// Supprime une image enregistrée par saveImage, uniquement dans le dossier attendu.
const removeImage = (url, folder) => {
    const prefix = `/Images/${folder}/`;
    if(!url || !url.startsWith(prefix)) return;
    const fileName = path.basename(url);
    const filePath = path.join(IMAGES_ROOT, folder, fileName);
    if(fs.existsSync(filePath)) fs.unlinkSync(filePath);
};

module.exports = { saveImage, removeImage, UploadError };
