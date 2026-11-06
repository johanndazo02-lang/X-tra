"""
Retire le fond des photos de maillots (Images/Maillots) et crée une version
PNG transparente à côté de chaque photo (même nom, extension .png).

- Les photos d'origine (.jpg) ne sont pas modifiées.
- Une photo déjà traitée (le .png existe) est sautée : on peut relancer
  le script après avoir ajouté de nouvelles photos.

Lancement (depuis le dossier X-Tra) :
    C:\\Users\\User\\.venvs\\rembg\\Scripts\\python.exe tools\\retirer-fonds.py
Options :
    --force        refait aussi les photos déjà traitées
    --seulement X  ne traite que les fichiers dont le chemin contient X
"""
import sys
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

RACINE = Path(__file__).resolve().parent.parent
DOSSIER = RACINE / 'Images' / 'Maillots'
EXTENSIONS = {'.jpg', '.jpeg', '.webp', '.avif'}
# Modèle conçu pour les objets en général : meilleurs contours sur les maillots clairs
MODELE = 'isnet-general-use'


def main():
    force = '--force' in sys.argv
    filtre = None
    if '--seulement' in sys.argv:
        filtre = sys.argv[sys.argv.index('--seulement') + 1].lower()

    photos = sorted(p for p in DOSSIER.rglob('*') if p.suffix.lower() in EXTENSIONS)
    if filtre:
        photos = [p for p in photos if filtre in str(p).lower()]

    session = new_session(MODELE)
    faites, sautees = 0, 0
    for photo in photos:
        sortie = photo.with_suffix('.png')
        if sortie.exists() and not force:
            sautees += 1
            continue
        with Image.open(photo) as image:
            resultat = remove(image.convert('RGB'), session=session)
        resultat.save(sortie, optimize=True)
        faites += 1
        print(f'[{faites}] {sortie.relative_to(RACINE)}')

    print(f'Terminé : {faites} photo(s) traitée(s), {sautees} déjà faite(s).')


if __name__ == '__main__':
    main()
