---
tags: [x-tra, backend, api]
---

# Backend / API

Dossier : `backend/`. Node.js + Express, connexion PostgreSQL via le module `pg`
(pool de connexions dans `backend/src/db.js`, configuré depuis `backend/.env`).

Fichier d'entrée : `backend/src/server.js`, qui monte les routeurs suivants
(tous sous le préfixe `/api`) :

| Préfixe | Fichier | Rôle |
|---|---|---|
| `/api/auth` | `routes/auth.routes.js` | inscription / connexion |
| `/api/products` | `routes/products.routes.js` | catalogue produits, recherche, fiche produit |
| `/api/orders` | `routes/orders.routes.js` | passage de commande, historique client (protégé) |
| `/api/leagues` | `routes/leagues.routes.js` | liste des championnats, équipes d'un championnat |
| `/api/teams` | `routes/teams.routes.js` | fiche équipe, maillots d'une équipe |
| `/api/contact` | `routes/contact.routes.js` | formulaire de contact |

## Détail des routes

### `auth.routes.js`
- `POST /api/auth/register` — crée un utilisateur (`bcryptjs` pour le hash), renvoie `{ token, user }`
- `POST /api/auth/login` — vérifie l'email/mot de passe, renvoie `{ token, user }`

### `products.routes.js`
- `GET /api/products` — liste complète (utilisé par l'ancienne grille produits de l'accueil)
- `GET /api/products/search?q=...` — recherche texte (nom / équipe / championnat), utilisé par `recherche.html`
- `GET /api/products/:id` — fiche produit complète, utilisé par `produit.html`

### `orders.routes.js` (protégées par `requireAuth`)
- `POST /api/orders` — crée une commande à partir du panier envoyé par le client.
  **Revalide chaque prix côté serveur** en relisant `products` en base plutôt que
  de faire confiance au prix transmis par le frontend (correctif de sécurité
  appliqué en cours de projet). Champs acceptés : `items`, `paid`, `address`,
  `phone`, `paymentMethod`.
- `GET /api/orders/me` — historique des commandes de l'utilisateur connecté (avec
  ses `order_items`), utilisé par `dashboard.html`.

### `leagues.routes.js`
- `GET /api/leagues` — les 5 championnats (logos)
- `GET /api/leagues/:id/teams` — équipes d'un championnat, utilisé par `teams.html`

### `teams.routes.js`
- `GET /api/teams/:id` — infos d'une équipe (nom, blason, année de fondation, historique, équipementier, sponsors)
- `GET /api/teams/:id/jerseys` — tous les maillots de l'équipe, triés par `category`
  puis `season_start_year DESC NULLS LAST` (les maillots réels récents avant les
  entrées d'archive historique sans image)

### `contact.routes.js`
- `POST /api/contact` — enregistre un message dans la table `contact_messages`

## Authentification

Middleware `backend/src/middleware/auth.js` (`requireAuth`) : lit l'en-tête
`Authorization: Bearer <token>`, vérifie le JWT (`JWT_SECRET` dans `.env`),
attache `req.user` à la requête. Utilisé uniquement sur `/api/orders` et
`/api/orders/me`.

## Scripts de peuplement (seed)

Dans `backend/src/`, tous exécutables à la main via `node src/<script>.js`
(pas de CI/automatisation dessus — voir [[Etat-du-depot]]) :

- `init-db.js` — exécute `schema.sql` (création/migration des tables)
- `seed-teams.js` — équipes de base
- `seed-crests-laliga.js` / `seed-crests-all.js` — blasons des équipes
- `seed-history.js` — années de fondation (faits vérifiables uniquement, voir [[Politique-de-donnees]])
- `seed-kit-categories.js` — catégories de maillots (Avant-match/Entraînement/Voyage)
- `seed-athletic-bilbao.js`, `seed-athletic-bilbao-history.js`, `seed-athletic-bilbao-full-history.js` — catalogue réel Athletic Bilbao (photos fournies par l'utilisateur)
- `seed-atletico-madrid.js`, `seed-real-madrid.js` — autres équipes partiellement peuplées
- `delete-products.js`, `list-products.js` — utilitaires de maintenance

Voir [[Roadmap]] pour la liste des équipes encore en placeholder générique.
