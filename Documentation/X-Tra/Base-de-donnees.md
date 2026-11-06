---
tags: [x-tra, database, postgresql]
---

# Base de données

PostgreSQL, schéma cumulatif dans `backend/src/schema.sql` (que des
`CREATE TABLE IF NOT EXISTS` / `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`,
donc rejouable sans casser une base existante — pas d'outil de migration
dédié type Knex/Prisma, c'est un seul fichier SQL idempotent).

```mermaid
erDiagram
    LEAGUES ||--o{ TEAMS : "contient"
    TEAMS ||--o{ PRODUCTS : "a des maillots"
    USERS ||--o{ ORDERS : "passe"
    ORDERS ||--o{ ORDER_ITEMS : "contient"
    PRODUCTS ||--o{ ORDER_ITEMS : "référencé par"

    LEAGUES {
        serial id PK
        varchar name
        varchar logo_url
    }
    TEAMS {
        serial id PK
        int league_id FK
        varchar name
        varchar crest_url
        int founded_year
        text history
        text suppliers
        text sponsors
    }
    PRODUCTS {
        serial id PK
        varchar name
        int price
        varchar image_url
        int team_id FK
        varchar season
        int season_start_year
        varchar type
        varchar category
        varchar design
        varchar colors
        varchar brand
        varchar sizes
        text players
    }
    USERS {
        serial id PK
        varchar name
        varchar email
        text password_hash
        timestamptz created_at
    }
    ORDERS {
        serial id PK
        int user_id FK
        varchar status "payé | impayé"
        int total
        text address
        varchar phone
        varchar payment_method
        timestamptz created_at
    }
    ORDER_ITEMS {
        serial id PK
        int order_id FK
        int product_id FK
        varchar name
        int price
        int qty
    }
    CONTACT_MESSAGES {
        serial id PK
        varchar name
        varchar email
        varchar subject
        text message
        timestamptz created_at
    }
```

## Notes sur les tables

- **`products.category`** — valeurs utilisées : `Maillots` (défaut),
  `Avant-match`, `Entraînement`, `Voyage`, et `Archive historique` pour les
  entrées placeholder du timeline historique (pas d'image réelle, pas de prix
  ni bouton d'achat). Voir [[Politique-de-donnees]].
- **`products.team_id`** est nullable (`ON DELETE SET NULL`) : une commande
  passée reste lisible même si un produit est supprimé plus tard.
- **`products.season_start_year`** pilote le tri chronologique des maillots
  d'une équipe (`ORDER BY category, season_start_year DESC NULLS LAST` dans
  `teams.routes.js`). Un produit réel sans cette valeur remonte *après* les
  placeholders d'archive — bug déjà rencontré et corrigé une fois (voir
  [[Etat-du-depot]] pour l'historique des bugs de ce type).
- **`orders.status`** est contraint par un `CHECK` SQL à seulement deux
  valeurs : `'payé'` ou `'impayé'` — pas d'états intermédiaires.
- **`products.league`** (colonne `VARCHAR` ajoutée avant `team_id`/`teams`)
  est un reliquat de la première version du catalogue (avant la
  normalisation championnat→équipe→maillot) ; la donnée de championnat passe
  maintenant par `products.team_id → teams.league_id → leagues`.

## Connexion

`backend/src/db.js` lit `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`,
`DB_NAME` depuis `backend/.env` (fichier non versionné, voir
[[Etat-du-depot]]) pour construire un `pg.Pool`.
