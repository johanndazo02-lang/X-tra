---
tags: [x-tra, roadmap, todo]
---

# Roadmap / demandes en attente

## ✅ Refonte de team.html — terminée (vérifiée le 02/11/2026)

La demande « interrompue » a bien été implémentée (dans `team.js` / `style.css`) :

1. Les produits de la saison en cours sont regroupés **par saison uniquement** :
   une seule section **« 2026/2027 »** contient maillots, avant-match,
   entraînement et voyage (même chose pour 2025/2026).
2. L'ancienne tuile en pointillés « +N articles » est remplacée par un
   **survol sur la 6ᵉ vignette** (`MAX_VISIBLE_PER_ROW = 6`) : image assombrie
   et texte « Regarder tous (+N) » (`buildOverlayCard`, classe `.kit-overlay`).
   Un clic révèle toute la rangée, puis une tuile « Voir moins » la replie.

Vérifié sur l'Athletic Bilbao : « Regarder tous (+18) » en 2026/2027 et
« (+28) » en 2025/2026.

## Contenu produit

- Seule **Athletic Bilbao** a un catalogue complet à partir de vraies
  photos fournies par l'utilisateur. **Atlético Madrid** et **Real Madrid**
  sont partiellement peuplés (`seed-atletico-madrid.js`,
  `seed-real-madrid.js`). Les **~109 autres équipes** des 5 championnats
  n'ont que des placeholders génériques.
- Règle à respecter en peuplant la suite : [[Politique-de-donnees]] — ne
  jamais inventer un design/couleur non vérifié, lire chaque vraie photo
  avant de la décrire.

## Dépôt / infra

- Décider du premier commit git (voir [[Etat-du-depot]]).
- Évaluer la montée vers express 5 (résoudrait la vulnérabilité `qs`, mais
  demande de revalider toute la gestion d'erreurs async — pas de suite de
  tests automatisés pour sécuriser cette montée aujourd'hui).

## Hors scope actuel (mentionné en fonctionnalités, pas en cours)

- Vrai paiement en ligne (Orange Money/Mvola/Airtel réels).
- Espace admin pour gérer le catalogue sans passer par des scripts.
- Emails transactionnels.

Voir [[Fonctionnalites#Ce qui n'existe pas (volontairement, à ce stade)]].
