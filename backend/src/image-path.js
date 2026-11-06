const fs = require('fs');
const path = require('path');

// Racine du site (dossier X-Tra), deux niveaux au-dessus de backend/src
const SITE_ROOT = path.join(__dirname, '..', '..');

// Si une version PNG détourée (fond transparent) existe à côté de la photo,
// on utilise celle-là. Les PNG sont créés par tools/retirer-fonds.py.
const preferPng = (imageUrl) => {
    if(!/\.(jpe?g|webp|avif)$/i.test(imageUrl)) return imageUrl;
    const pngUrl = imageUrl.replace(/\.(jpe?g|webp|avif)$/i, '.png');
    return fs.existsSync(path.join(SITE_ROOT, pngUrl)) ? pngUrl : imageUrl;
};

module.exports = { preferPng };
