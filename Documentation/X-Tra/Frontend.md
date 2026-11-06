---
tags: [x-tra, frontend]
---

# Frontend

Site multi-pages, HTML/CSS/JS vanilla (aucun bundler, aucun framework). Toutes
les pages boutique partagent deux scripts, chargés dans cet ordre :

1. **`store.js`** — client API : `API_BASE = 'http://localhost:3000/api'`,
   fonctions `fetchProducts`, `fetchProduct`, `searchProducts`, `fetchLeagues`,
   `fetchLeagueTeams`, `fetchTeam`, `fetchTeamJerseys`, `apiLogin`,
   `apiRegister`, `placeOrder`, `fetchMyOrders`, `sendContactMessage`,
   `formatPrice`, `getCurrentUser`, `setSession`, `clearSession`. C'est la
   seule couche qui parle HTTP — les pages ne font jamais `fetch()` directement.
2. **`nav.js`** — logique partagée de la barre de navigation : ouverture/
   fermeture du panier (`localStorage` clé `xtra_cart`), du panneau
   connexion/inscription/compte, mise à jour du compteur panier, déconnexion.

Puis un script propre à chaque page :

| Page | Script | Rôle |
|---|---|---|
| `index.html` | `app.js` | accueil : 5 cartes de championnats (clic → `teams.html?league=ID`) |
| `teams.html` | `teams.js` | grille des équipes d'un championnat |
| `team.html` | `team.js` | maillots d'une équipe, groupés par catégorie + timeline historique |
| `produit.html` | `produit.js` | fiche détaillée d'un maillot (tailles, bouton Commander) |
| `recherche.html` | `recherche.js` | résultats de recherche texte |
| `checkout.html` | `checkout.js` | formulaire de commande (adresse, téléphone, mode de paiement) |
| `confirmation.html` | `confirmation.js` | récapitulatif après commande validée |
| `dashboard.html` | `dashboard.js` | tableau de bord client : commandes payées/impayées, stats du mois |
| `contact.html` | `contact.js` | formulaire de contact → `POST /api/contact` |

Pages statiques sans script dédié : `a-propos.html`, `cgv.html`,
`mentions-legales.html`, `404.html`.

## `team.js` — la page la plus dense (262 lignes)

Affiche les maillots d'une équipe groupés par catégorie
(`buildCategorySection`), avec deux mécanismes de troncature indépendants
pour éviter une page interminable :

- **`fillRow` / `MAX_VISIBLE_PER_ROW = 4`** — dans une même catégorie, au-delà
  de 4 maillots visibles, une tuile en pointillés « +N articles »
  (`buildMoreTile`) révèle le reste au clic.
- **`MAX_VISIBLE_SEASONS = 3`** — sur la timeline historique par décennie,
  seules les 3 périodes les plus récentes sont affichées par défaut ; un
  bouton « Voir l'historique complet (+N périodes) » révèle les plus
  anciennes. Ajouté après un retour utilisateur : la page atteignait
  ~5638px de haut avec 14 décennies affichées d'un coup, ce qui rendait les
  autres catégories (Avant-match, Entraînement, Voyage) invisibles sans
  scroller énormément.

## `produit.js` — fiche produit (89 lignes)

Reproduit la mise en page d'un site de référence de type fiche technique de
maillot (tableau Équipe / Saison / Type / Conception / Couleurs / Marque /
Compétition / Classement), sélecteur de taille (S à XXL), bouton
**Commander** unique point d'entrée du panier depuis cette page (l'icône
panier qui apparaissait au survol des vignettes sur `team.html` a été
retirée à la demande de l'utilisateur — seul le bouton Commander déclenche
l'ajout au panier).

## Style visuel

`style.css` définit notamment `.kit-item` / `.kit-thumb` / `.kit-thumb-wrap`
(vignettes rondes façon boutique officielle Castore) qui ont remplacé les
premières cartes rectangulaires `.produits-box`.
