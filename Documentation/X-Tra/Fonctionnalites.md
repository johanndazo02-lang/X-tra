---
tags: [x-tra, fonctionnalites]
---

# Fonctionnalités

Vue par écran de ce que le site permet réellement de faire aujourd'hui.

## Compte utilisateur
- Inscription (nom, email, mot de passe ≥ 6 caractères, confirmation) et
  connexion, dans un panneau latéral accessible depuis n'importe quelle page
  (icône compte). Session en JWT persistée dans `localStorage`.

## Navigation catalogue
- Accueil : 5 cartes de championnats (logos de ligues) au lieu d'une grille
  de maillots — décision prise pour orienter vers la navigation par
  championnat plutôt qu'un catalogue plat.
- `teams.html?league=ID` : équipes du championnat.
- `team.html?team=ID` : maillots de l'équipe, groupés en sections **Maillots
  / Avant-match / Entraînement / Voyage**, plus une section **Archive
  historique** par décennie depuis la fondation du club (placeholders
  explicites pour les périodes sans photo réelle — voir
  [[Politique-de-donnees]]).

## Fiche produit
- `produit.html?id=ID` : photo, tableau d'informations (équipe, saison,
  type, conception, couleurs, marque, compétition, classement), sélecteur
  de taille, bouton **Commander**.

## Recherche
- Barre de recherche dans la nav → `recherche.html?q=...` → résultats via
  `GET /api/products/search`.

## Panier
- Stocké côté client (`localStorage`) jusqu'à validation. Panneau latéral
  accessible depuis toutes les pages via `nav.js`.

## Commande
- `checkout.html` : formulaire adresse / téléphone / mode de paiement
  (Orange Money, Mvola, Airtel Money, ou paiement à la livraison — les 3
  premiers modes marquent la commande `payé`, la livraison la marque
  `impayé`).
- Les prix sont **revalidés côté serveur** avant création de la commande
  (voir [[Backend-API]]).
- `confirmation.html` : récapitulatif post-commande (numéro de commande,
  statut, détails livraison, articles).

## Tableau de bord client
- `dashboard.html` : statistiques (commandes du mois, payées, impayées) +
  liste des commandes séparée payées/impayées + historique des articles
  achetés. Accès protégé (redirection vers l'accueil si non connecté).

## Contact
- `contact.html` → `POST /api/contact`, enregistré dans
  `contact_messages` (pas d'envoi d'email, juste une trace en base).

## Ce qui n'existe pas (volontairement, à ce stade)
- Pas de vrai paiement en ligne (les "modes de paiement" ne font
  qu'étiqueter la commande, aucune intégration Orange Money/Mvola/Airtel
  réelle).
- Pas d'espace admin pour gérer le catalogue — le peuplement se fait par
  scripts `seed-*.js` lancés à la main (voir [[Backend-API#Scripts de
  peuplement (seed)]]).
- Pas d'emails transactionnels (confirmation de commande, etc.).
