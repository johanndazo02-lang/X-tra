---
tags: [x-tra, deploiement, pm2]
---

# Déploiement / exécution locale

Le site n'est pas déployé en ligne : tout tourne en local sur la machine de
l'utilisateur (Windows 11).

## Backend

Géré par **PM2** (et non plus un `npm start` lancé à la main dans un
terminal, qui mourrait à chaque fermeture de session/redémarrage) :

```powershell
pm2 list                      # état du processus
pm2 logs xtra-backend         # logs en direct
pm2 restart xtra-backend      # recharger après une modif du code backend
pm2 stop xtra-backend
```

Mis en place car le processus manuel ne survivait ni à un crash ni à un
redémarrage de session/PC. Deux garanties ajoutées :

1. **Redémarrage auto en cas de crash** — PM2 relance le process
   automatiquement (testé en tuant le PID manuellement : relance en ~3s,
   compteur de restart incrémenté).
2. **Démarrage auto au boot Windows** — via `pm2-windows-startup`
   (`pm2-startup install`) + `pm2 save` (liste des process persistée dans
   `C:\Users\User\.pm2\dump.pm2`, restaurée automatiquement).

> ⚠️ PM2 ne recharge pas le code tout seul quand un fichier change (pas de
> `--watch` activé, pour éviter des redémarrages intempestifs pendant
> l'édition). Après une modif de `backend/src/**`, il faut lancer
> `pm2 restart xtra-backend` à la main.

## Base de données

PostgreSQL installé comme **service Windows** (`postgresql-x64-17`), démarre
avec Windows indépendamment de PM2.

## Frontend

Fichiers statiques servis soit par l'extension Live Server de VS Code
(`http://127.0.0.1:5500`), soit par `python -m http.server` en test — pas de
serveur dédié, pas de build (aucun bundler).

## Variables d'environnement

`backend/.env` (non versionné, voir [[Etat-du-depot]]) : `DB_HOST`,
`DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `PORT=3000`.
