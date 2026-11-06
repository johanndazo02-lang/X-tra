---
tags: [x-tra, index]
---

# X-Tra — Documentation du projet

Boutique en ligne (fictive) de maillots de football, en français, développée pendant
cette série de sessions. Ce vault Obsidian sert de carte du projet : ce qui a été
construit, pourquoi, et ce qu'il reste à faire.

> Pour ouvrir ce vault dans Obsidian : `Ouvrir un dossier comme coffre` →
> `D:\Projet Web\Claude\X-Tra\Documentation`.

## Vue d'ensemble en une phrase

Un site vitrine + boutique (HTML/CSS/JS vanilla, sans framework) qui consomme une
API REST (Node/Express + PostgreSQL) pour afficher un catalogue de maillots organisé
par **championnat → équipe → maillot**, avec compte utilisateur, panier, commande et
tableau de bord client.

## Notes du vault

- [[Architecture]] — vue d'ensemble technique (frontend / API / base de données)
- [[Backend-API]] — le serveur Express : routes, middleware, auth
- [[Base-de-donnees]] — schéma PostgreSQL, tables et relations
- [[Frontend]] — les pages du site et leurs scripts JS
- [[Fonctionnalites]] — ce que le site permet de faire, écran par écran
- [[Deploiement]] — comment le backend tourne en continu (PM2)
- [[Politique-de-donnees]] — règle anti-fabrication de contenu produit
- [[Etat-du-depot]] — état git, secrets, dépendances
- [[Roadmap]] — demandes en attente et suite possible

## Repères rapides

| Élément | Valeur |
|---|---|
| Dossier du site (frontend statique) | `D:\Projet Web\Claude\X-Tra` |
| Dossier du backend | `D:\Projet Web\Claude\X-Tra\backend` |
| Port API | `http://localhost:3000/api` |
| Base de données | PostgreSQL, service Windows `postgresql-x64-17` |
| Process backend | géré par PM2 sous le nom `xtra-backend` |
| Langue du site | Français |
| Devise affichée | Ariary (`AR`), formatée par `formatPrice()` dans `store.js` |
