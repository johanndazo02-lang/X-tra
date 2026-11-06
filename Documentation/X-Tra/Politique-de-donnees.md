---
tags: [x-tra, politique, integrite]
---

# Politique anti-fabrication de contenu

Règle établie explicitement avec l'utilisateur pendant le développement du
catalogue historique, et appliquée depuis à tout contenu produit du site.

## La règle

**Ne jamais inventer un fait vérifiable inconnu** (design précis d'un
maillot à une saison donnée, couleurs exactes, historique détaillé d'un
club) et le présenter comme réel sur le site.

## D'où ça vient

Quand l'utilisateur a demandé l'historique des maillots « depuis la
création du club », la première proposition envisagée était de générer des
centaines d'entrées avec des designs inventés par club et par saison —
refusée à juste titre : c'est de la désinformation présentée comme un fait
sur un site marchand.

**Solution retenue** : n'ajouter que des faits réellement vérifiables
(année de fondation des clubs — connaissance publique fiable), et laisser
le reste en **placeholder explicite** :
- `products.category = 'Archive historique'`
- image générique « Photo à venir »
- pas de prix, pas de bouton d'achat

Voir [[Base-de-donnees]] pour la structure de table correspondante et
[[Frontend#`team.js` — la page la plus dense (262 lignes)]] pour l'affichage
(timeline par décennie, tronquée aux 3 périodes les plus récentes par
défaut).

## Application aux vraies photos fournies

Quand l'utilisateur a fourni de vraies photos (catalogue Athletic Bilbao,
marque Castore), chaque image a été **lue avec l'outil de lecture avant
d'en décrire les couleurs/motifs** dans la fiche produit, plutôt que de
deviner à partir du nom de fichier. Plusieurs couleurs réelles (ex. gilet
de voyage marine/vert menthe, et non « marine/blanc » comme dans l'exemple
de référence donné par l'utilisateur) ne correspondaient pas à ce qu'on
aurait pu supposer sans regarder.

## Comment l'appliquer à toute nouvelle donnée produit

Avant d'ajouter une description produit (conception, couleurs, joueurs
associés, avis/notes), un des trois cas doit être vrai :

1. Le fait est connu avec une confiance raisonnable (ex. année de fondation
   d'un grand club, joueurs actuels notoires) → on peut l'affirmer.
2. Une vraie image existe → il faut la regarder avant de décrire.
3. Aucun des deux → placeholder explicite (« à préciser », « pas de votes »,
   « photo à venir »), jamais une valeur inventée qui a l'air d'un fait.

Voir [[Roadmap]] pour la liste des équipes encore en attente de vraies
photos (tout sauf Athletic Bilbao, partiellement Atlético Madrid et Real
Madrid).
