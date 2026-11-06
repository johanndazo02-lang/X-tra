---
tags: [x-tra, architecture]
---

# Architecture

X-Tra est une application classique en trois couches, sans framework frontend
(pas de React/Vue) : pages HTML statiques + JS vanilla, une API REST, une base
relationnelle.

```mermaid
flowchart LR
    subgraph Frontend["Frontend statique (HTML/CSS/JS vanilla)"]
        A[index.html] --> S[store.js\nclient API]
        B[teams.html / team.html] --> S
        C[produit.html] --> S
        D[dashboard.html] --> S
        E[checkout.html / confirmation.html] --> S
        F[recherche.html / contact.html] --> S
        NAV[nav.js\npanier / connexion / compte] -.inclus sur toutes les pages.-> A
        NAV -.-> B
        NAV -.-> C
        NAV -.-> D
    end

    S -->|fetch JSON, Authorization: Bearer <JWT>| API

    subgraph API["Backend Express (D:\\Projet Web\\X-Tra\\backend)"]
        R1[/api/auth]
        R2[/api/products]
        R3[/api/orders]
        R4[/api/leagues]
        R5[/api/teams]
        R6[/api/contact]
    end

    API --> PG[(PostgreSQL\nxtra)]
```

## Pourquoi pas de framework frontend

Choix initial du projet : rester en HTML/CSS/JS vanilla multi-pages plutôt que
SPA. Chaque page HTML charge deux scripts partagés (`store.js` pour parler à
l'API, `nav.js` pour le panier/compte/menu) puis un script spécifique à la page
(`team.js`, `produit.js`, `dashboard.js`, etc.). Voir [[Frontend]].

## Authentification

JWT signé côté serveur (`jsonwebtoken`), mot de passe hashé avec `bcryptjs`.
Le token est stocké dans `localStorage` (`xtra_token`) et renvoyé dans l'en-tête
`Authorization: Bearer <token>` pour les routes protégées (`/api/orders`,
`/api/orders/me`). Voir [[Backend-API#Authentification]].

## Panier

Le panier n'existe **que côté client**, dans `localStorage` (`xtra_cart`), tant
que la commande n'est pas validée. Ce n'est qu'à la soumission du formulaire de
`checkout.html` que le panier est envoyé à `POST /api/orders`, où le serveur
**revalide les prix côté base de données** (pas de confiance dans les prix
envoyés par le client — protection contre la manipulation de prix côté front).

## Catalogue : championnat → équipe → maillot

C'est la structure centrale du site, reflétée dans le schéma (voir
[[Base-de-donnees]]) et dans la navigation (voir [[Frontend]]) :

1. `index.html` affiche 5 cartes de championnats (logos de ligues)
2. `teams.html?league=ID` liste les équipes du championnat choisi
3. `team.html?team=ID` liste les maillots de l'équipe, groupés par catégorie
   (Maillots / Avant-match / Entraînement / Voyage / Archive historique)
4. `produit.html?id=ID` affiche la fiche détaillée d'un maillot précis
