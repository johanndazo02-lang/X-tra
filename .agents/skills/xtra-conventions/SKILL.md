---
name: xtra-conventions
description: Conventions du site X-Tra (boutique de maillots de foot, Madagascar) — charte graphique, structure des pages HTML, scripts front (store.js / nav.js), API Express + PostgreSQL + JWT, seeds et règles d'intégrité des données produits. À utiliser dès qu'on crée ou modifie une page, un style, un script front, une route API, une table SQL, un seed ou une fiche produit/équipe dans ce projet, même si la demande ne parle pas explicitement de "conventions" (ex. « ajoute une page wishlist », « crée une route pour les avis », « ajoute les maillots du PSG »).
---

# Conventions X-Tra

X-Tra est un site vitrine + boutique de maillots de football (5 grands championnats),
en HTML/CSS/JS vanilla à la racine, avec une API Node/Express + PostgreSQL dans `backend/`.
Pas de framework, pas de build : chaque page est un fichier `.html` servi tel quel.
Le but de ces conventions est que toute nouvelle pièce ressemble au reste du site — un
visiteur ne doit pas sentir de rupture, et le code doit rester lisible par l'équipe.

Avant d'écrire, ouvre le fichier existant le plus proche de ce que tu fais (ex. `teams.html`
+ `teams.js` pour une page liste, `routes/teams.routes.js` pour une route en lecture,
`routes/orders.routes.js` pour une route protégée/transactionnelle) et calque-toi dessus.

## 1. Charte graphique

Tout passe par les variables de `style.css` — n'introduis pas de nouvelles couleurs en dur :

| Variable | Valeur | Usage |
|---|---|---|
| `--accent` | `#000` | boutons, mots mis en avant, soulignés, scrollbar |
| `--accent2` | `#444` | survol des boutons |
| `--text` | `#333` | texte courant |
| `--light` | `#fff` | fonds, texte sur accent |
| `--second` | `#e2e2e2` | fonds secondaires |
| `--box-shadow` | `2px 2px 10px 2px rgba(0,0,0,0.2)` | cartes |

- Charte **noir et blanc** (depuis octobre 2026) : pas de rouge, vert ou autre teinte.
  Les états (payé / impayé) se distinguent par plein noir vs contour, pas par la couleur.
  Sur un fond noir (footer, carte héro), redéfinis `--accent: var(--light)` localement
  pour que les éléments en accent restent visibles — mais alors n'utilise pas
  `var(--accent)` pour le fond de ce même bloc (écris `#000`).
- Police : **Poppins** (importée en tête de `style.css`), rien d'autre.
- Icônes : **Boxicons 2.1.4** (`<i class="bx bx-...">`), pas d'autre bibliothèque d'icônes.
- Bouton principal : classe `.btn` (forme biseautée par `clip-path`, majuscules, reflet au survol).
  Boutons de formulaires du panneau utilisateur : `.btn-user`.
- Titres de section : le motif maison, avec la ligne rouge en fond et un mot en accent :
  ```html
  <div class="section-heading">
      <h2>Nos<span> Produits</span></h2>
  </div>
  ```
- Sections : `padding: 50px 80px` par défaut ; une section placée juste sous la nav reçoit
  la classe `page-top`.
- Responsive : réutilise les points de rupture existants (`1080px`, `991px`, `768px`, `380px`)
  en `@media screen and (max-width: ...)`, regroupés en fin de fichier.
- Commentaires de bloc : le style bannière du projet, en CSS comme en HTML/JS :
  ```css
  /* ##################### */
  /* Nom du bloc */
  /* ##################### */
  ```
- Ajoute les nouveaux styles dans `style.css` (un seul fichier de styles), dans un bloc
  bannière dédié, plutôt qu'en `<style>` inline.

## 2. Structure d'une page

Toutes les pages partagent la même ossature. Pour en créer une, **copie la nav et le footer
d'une page interne existante** (`team.html` est la référence) plutôt que de les réécrire —
`nav.js` dépend de leurs id/classes exacts (`#search-icon`, `#cart-icon`, `#user-icon`,
`#menu-icon`, `.search-container`, `.cart-container`, `.user-container`, `.login-form`,
`.signup-form`, `.account-view`…), et un élément manquant fait planter tout le script.

Ossature :
1. `<html lang="fr">`, `<meta charset="UTF-8">`, viewport, Boxicons, `style.css`,
   `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`.
2. `<title>X-Tra - Nom de la page</title>` (la page d'accueil est juste `X-Tra`).
3. `<nav>` complète (logo, liens vers `index.html#accueil|#nouveautes|#produits`, icônes,
   recherche, panier, panneau compte).
4. Une ou plusieurs `<section>` de contenu.
5. `<footer class="site-footer">` (voir section 5 pour sa structure).
6. Scripts en bas de `<body>`, **dans cet ordre** : `store.js` (client API + session),
   `nav.js` (nav, panier, connexion), puis le script propre à la page (`nom-page.js`).
   Swiper n'est chargé que sur l'accueil.

Nommage : fichiers en français, minuscules, avec tirets (`mentions-legales.html`,
`a-propos.html`), et un fichier JS du même nom que la page. Paramètres d'URL simples via
`URLSearchParams` (`team.html?team=12`, `teams.html?league=Liga`, `recherche.html?q=...`).

## 3. JavaScript front

- Vanilla JS, `const` + fonctions fléchées, `async/await`, `document.querySelector`.
  Style du projet : `if(cond){` sans espace après `if`, quotes simples, 4 espaces.
- **Tous les appels API passent par `store.js`** : ajoute une fonction `fetchXxx` /
  `apiXxx` à côté des autres, sur le même modèle (`API_BASE`, `res.ok` vérifié, message
  d'erreur en français, en-tête `Authorization: Bearer ${getToken()}` si la route est
  protégée). Les scripts de page n'appellent jamais `fetch` directement.
- Session et panier dans `localStorage` sous les clés `xtra_token`, `xtra_user`, `xtra_cart` ;
  utilise `getToken()`, `getCurrentUser()`, `setSession()`, `clearSession()`, `addToCart()`.
- Prix : entiers en **ariary**, toujours affichés via `formatPrice()` → `65.000AR`.
- Script de page type : sélection des éléments en haut, une fonction `renderXxx(data)`,
  puis une fonction `init()` async appelée en fin de fichier. Prévois trois états visibles :
  chargement (`<p>Chargement des ...</p>` dans le HTML), vide (« Aucun ... trouvé »), et
  erreur (« Impossible de charger ... Vérifiez que le serveur backend est démarré. »).
- Image manquante : repli sur `/Images/maillot-placeholder.svg`.
- Sécurité : le code existant injecte des valeurs de la base dans `innerHTML`. Pour tout
  texte saisi par un utilisateur (nom, avis, message…), utilise `textContent` ou échappe la
  valeur — ne propage pas ce motif à des données non maîtrisées.

## 4. Backend (Express + PostgreSQL + JWT)

Structure dans `backend/src/` :
- `server.js` monte chaque routeur sous `/api/<ressource>` ; une nouvelle ressource =
  un fichier `routes/<ressource>.routes.js` + une ligne `app.use(...)` à côté des autres,
  **avant** le handler 404.
- `db.js` exporte un `Pool` `pg` configuré par `.env` (`DB_HOST`, `DB_PORT`, `DB_USER`,
  `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT`). Toute nouvelle variable va aussi dans
  `.env.example` avec une valeur factice. Ne lis ni ne recopie jamais le vrai `.env`.
- CommonJS (`require` / `module.exports`), pas d'ESM.

Modèle d'une route :
```js
router.get('/:id', async (req, res, next) => {
    try {
        const result = await pool.query('SELECT ... WHERE id = $1', [req.params.id]);
        if(result.rows.length === 0){
            return res.status(404).json({ error: 'Ressource introuvable.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});
```
- Requêtes **toujours paramétrées** (`$1, $2…`), jamais de concaténation de chaînes.
- Erreurs : `{ error: 'Message en français.' }` avec le bon code (400 validation, 401 auth,
  404 introuvable, 409 doublon) ; les erreurs inattendues vont à `next(err)` → 500 générique.
- Réponses en JSON brut (`res.json(rows)`), colonnes en `snake_case` telles que renvoyées
  par Postgres ; `201` pour une création.
- Admin : `requireAuth, requireAdmin` (colonne `users.is_admin`, relue en base à chaque
  requête). Toute donnée globale (ventes, clients) passe par là. Créer un admin :
  `node src/make-admin.js <email> "Nom"` (mot de passe généré, affiché une seule fois ;
  `--nouveau-mot-de-passe` pour le régénérer, `--retirer` pour enlever les droits).
- Auth : `requireAuth` de `middleware/auth.js` lit `Authorization: Bearer <jwt>` et pose
  `req.userId`. Tokens signés `{ userId }`, expiration `30d`, mots de passe en `bcryptjs`
  (coût 10), emails normalisés `trim().toLowerCase()`. Ne renvoie jamais `password_hash` —
  passe par un mapper comme `toPublicUser`.
- Écritures multi-tables : transaction `pool.connect()` → `BEGIN` / `COMMIT` / `ROLLBACK`
  / `client.release()` dans `finally`, comme `orders.routes.js`.
- Ne fais jamais confiance aux prix ou montants envoyés par le client : relis-les en base.

## 5. Schéma et seeds

- `schema.sql` est idempotent et rejoué par `npm run db:init` : nouvelles tables en
  `CREATE TABLE IF NOT EXISTS`, nouvelles colonnes en `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`
  ajoutés **à la fin**, sans modifier les lignes existantes. Clé `id SERIAL PRIMARY KEY`,
  dates `TIMESTAMPTZ NOT NULL DEFAULT now()`, prix `INTEGER` (ariary).
- Données : un script `src/seed-<sujet>.js` lancé à la main (`node src/seed-xxx.js`),
  qui commence par `require('dotenv').config()`, vérifie l'existence avant d'insérer (pour
  pouvoir être relancé sans doublons), affiche un compte rendu et ferme le pool.
- Valeurs connues de `products.category` : `Maillots`, `Avant-match`, `Entraînement`, `Voyage`,
  `Ligue des Champions`.
- Catalogue de base : `node src/seed-season-catalog.js` garantit à chaque équipe un maillot
  domicile et extérieur pour les deux saisons gardées (placeholders, relançable sans doublon).
  Pas de third par défaut : il n'existe pas pour tous les clubs.
- Footer `.site-footer` (identique sur toutes les pages, copie-le de `team.html`) : carte
  sombre arrondie, bandeau noir du haut (logo, liens championnats, bouton « Voir les
  maillots », bouton retour en haut `.footer-to-top` géré par `nav.js`), puis colonnes
  Adresse/Téléphone/Email, Pages, Informations, et logos de paiement + copyright.
  Pas de réseaux sociaux ni de newsletter : retirés / inexistants, ne les ajoute pas.
- Photos réelles : `Images/Maillots/<Championnat>/<Club>/<AAAA-AAAA>/` (dossier `Buendesliga`
  avec cette orthographe). Les ajouter dans `src/seed-club-photos.js` (une entrée par
  photo regardée) : le script met à jour la fiche existante du même club/saison/type au
  lieu d'en créer une en double.
- Photo de profil client : `profile-photo.js` (`mountProfilePhoto(conteneur)`, recadrage carré
  côté navigateur), API `POST/DELETE /api/auth/me/avatar` + `GET /api/auth/me`, fichiers dans
  `Images/Avatars/` (ignoré par git). Tout envoi d'image passe par `src/uploads.js`
  (`saveImage` / `removeImage`, type vérifié sur le contenu).
- Accueil connecté : `home-client.js` remplace la bannière par l'espace client (commandes,
  panier, recommandations via `/api/products/recommendations`, championnats). Il réagit aux
  évènements `xtra:session` (émis par `setSession` / `clearSession`) et `xtra:cart` (émis
  par `saveCart`) : réutilise-les plutôt que de recharger la page.
- Carrousel « Nouveautés » de l'accueil : diapositives écrites en dur dans `index.html`
  (photos de `Images/Maillots/Champions League/`), chacune liée à `produit.html?id=…` ;
  un club absent de la base reçoit « Bientôt disponible » au lieu d'un bouton d'achat.
  Les prototypes et visuels non officiels sont acceptés par l'utilisateur.
- Historique d'un club : `src/seed-club-histories.js` (frises équipementiers / sponsors du
  plus récent au plus ancien + texte rédigé pour X-Tra, jamais copié d'un autre site).
  Un nom tronqué sur la source reste tronqué (« … ») tant qu'il n'est pas confirmé.
  Sur `team.html`, la frise devient un slider (flèches, fondus) dès qu'elle déborde ;
  un onglet sans données est masqué.
- **Catalogue limité à la saison en cours et la précédente** (saison démarrant en juillet,
  calculée par `src/seasons.js`). Un seed n'insère rien d'antérieur à
  `oldestKeptSeasonStart()` ; `node src/purge-old-seasons.js` retire les anciennes
  saisons après sauvegarde JSON dans `backend/backups/` (ignoré par git).

## 6. Intégrité des données (règle non négociable)

X-Tra est un site marchand : une info fausse présentée comme vraie trompe le client.
Pour chaque fait vérifiable (design ou couleurs d'un maillot, saison, fournisseur, sponsor,
joueurs, historique d'un club, avis/notes) :
1. **Tu le sais avec confiance** (ex. année de fondation d'un grand club) → tu peux l'écrire.
2. **Une vraie photo existe** dans `Images/` → ouvre-la avec l'outil Read et décris ce que tu
   vois, ne devine pas depuis le nom du fichier.
3. **Sinon** → placeholder explicite (`'à préciser'`, « Photo à venir »,
   `type = 'Archive historique'`, pas de prix ni de bouton d'achat, « pas encore d'avis »).

Ne génère jamais d'entrées en masse avec des contenus inventés pour « remplir » le catalogue ;
propose plutôt la structure avec placeholders et demande les sources à l'utilisateur.

## 7. Espace administrateur

Le back-office (`admin.html` + `admin.js` + `admin.css`) est **séparé de la boutique** :
aucun lien depuis les pages clients, `noindex`, sa propre session (`xtra_admin_token`,
`xtra_admin_user` via `apiAdminLogin` / `getAdminToken` / `clearAdminSession` dans
`store.js`), et son propre thème sombre noir et blanc en police JetBrains Mono — c'est
la seule exception à Poppins et au fichier unique `style.css`, avec « Mon dashboard »
(`dashboard.html`), qui réutilise `admin.css` à la demande de l'utilisateur. Ne mets jamais de données
admin (ventes, liste des clients) dans les pages clients, même masquées.

Back-office (onglets de `admin.html`, logique dans `admin-manage.js`, API
`routes/admin.routes.js` sous `/api/admin`, tout derrière `requireAuth, requireAdmin`) :
CRUD des produits (photo envoyée en base64 → `Images/Uploads/`, type vérifié sur le
contenu du fichier), statut des commandes (`payé` / `impayé` / `annulé`), rôles et
suppression des comptes (refusée si le compte a des commandes, ou si c'est soi-même),
modification du compte admin. Les appels passent par `adminRequest` dans `store.js`.

## 8. Langue et contenu

- Tout le texte visible et les messages d'erreur API sont en **français**.
- Contexte local : Madagascar, devise ariary (`AR`), paiements Orange Money, Mvola, Airtel Money.
- Les coordonnées du footer (`+261 34 00 000 00`, `contact@x-tra.com`) sont des
  placeholders : ne les présente pas comme réelles ailleurs dans le site.

## Avant de rendre

- La page s'ouvre sans erreur console (nav, panier et connexion fonctionnent) ?
- Les trois états chargement / vide / erreur sont gérés ?
- Couleurs via variables, Poppins, Boxicons, `.section-heading`, responsive à 768px ?
- Requêtes SQL paramétrées, erreurs en `{ error }` français, `.env.example` à jour ?
- Aucun fait produit/club inventé ?
