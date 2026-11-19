# X-Tra — boutique de maillots de football

Boutique en ligne (fictive) de maillots de football, en français : un front-end
en HTML/CSS/JavaScript sans framework qui consomme une API REST
**Node.js / Express + PostgreSQL**.

Le catalogue est organisé par **championnat → équipe → maillot**, avec compte
utilisateur, panier, commande, tableau de bord client et espace administrateur.

## Fonctionnalités

- **Comptes** : inscription et connexion (mots de passe hachés avec bcrypt, session JWT).
- **Catalogue** : championnats, équipes (histoire du club, équipementiers, sponsors),
  maillots groupés par saison, fiche produit avec choix de la taille.
- **Recherche** de produits.
- **Panier et commande** : adresse, téléphone, mode de paiement
  (Orange Money, Mvola, Airtel Money ou à la livraison). Les prix sont
  **revalidés côté serveur** avant la création de la commande.
- **Tableau de bord client** : statistiques et historique des commandes.
- **Espace administrateur** : gestion des produits, du statut des commandes et des comptes.
- **Formulaire de contact** enregistré en base.

## Stack

| Partie | Technologies |
|---|---|
| Front-end | HTML, CSS, JavaScript (vanilla) |
| Back-end | Node.js, Express, JWT, bcrypt |
| Base de données | PostgreSQL |

## Lancer le projet en local

Prérequis : Node.js et PostgreSQL.

```bash
cd backend
npm install
cp .env.example .env      # puis renseigner les accès à la base et JWT_SECRET
npm run db:init           # crée les tables
npm start                 # API sur http://localhost:3000/api
```

Ouvrir ensuite `index.html` avec un serveur statique (par exemple l'extension
Live Server de VS Code).

Créer un compte administrateur :

```bash
node src/make-admin.js <email> "Nom"
```

## Documentation

La documentation détaillée (architecture, API, schéma de la base, choix
techniques) se trouve dans [`Documentation/X-Tra`](Documentation/X-Tra/Accueil.md).

## Limites connues

- Pas de vrai paiement en ligne : le mode de paiement ne fait qu'étiqueter la commande.
- Pas d'e-mails transactionnels.

## Auteur

Johann DAZO — johann.dazo02@gmail.com
