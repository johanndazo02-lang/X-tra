---
tags: [x-tra, git, securite]
---

# État du dépôt git

## Commits

Le dépôt `D:\Projet Web\X-Tra` est initialisé sur la branche `main`, avec
l'identité git configurée globalement (nom : Johan DAZO, email :
davidnytsiry@gmail.com). Un grand nombre de fichiers sont **indexés
(staged)** mais **aucun commit n'a encore été créé** à ce jour — le premier
commit reste une décision en attente de l'utilisateur.

## Secrets et fichiers parasites déjà écartés

Avant tout commit, deux problèmes ont été repérés et corrigés dans l'index
(rien n'a fuité, puisqu'aucun commit n'existait encore) :

- `backend/node_modules/` et `backend/.env` (qui contient le vrai
  `JWT_SECRET` et le mot de passe Postgres) étaient indexés — désindexés
  (`git rm --cached -f`), toujours présents sur le disque, maintenant
  couverts par `.gitignore`.
- `version_IObitDel.dll` (résidu 0 octet d'IObit Uninstaller, sans lien
  avec le projet) était indexé — désindexé, laissé sur le disque, couvert
  par `*.dll` dans `.gitignore`.

`.gitignore` racine couvre : `node_modules/`, `.env`, `.vscode/`, `.idea/`,
`*.dll`/`*.exe`/`*.tmp`/`*.bak`, logs, fichiers OS.

## Dépendances backend (vérifié le 2026-09-12)

Après `npm update` (montées mineures déjà appliquées : express
4.19.2→4.22.2, dotenv 16.4.5→16.6.1) :

| Package | Actuel | Majeure disponible | Risque si on monte |
|---|---|---|---|
| express | 4.22.2 | 5.2.1 | change la gestion des erreurs async, retire des méthodes — casse possible de `server.js` sans tests |
| bcryptjs | 2.4.3 | 3.0.3 | passe en ESM-only, impacte le `require()` dans `middleware/auth.js` |
| dotenv | 16.6.1 | 17.4.2 | moins risqué |

`npm audit` : 2 vulnérabilités modérées sur `qs` (dépendance transitive
d'express 4.x), non corrigibles sans passer à express 5 — pas fait
volontairement pour éviter de casser l'API sans suite de tests.

## Décisions en attente

1. Faire le premier commit maintenant (état actuel, fonctionnel), ou
   d'abord traiter les montées de version majeures ci-dessus.
2. Voir [[Roadmap]] pour les autres tâches en attente côté produit.
