# Mon Challenge — app de suivi d'étirements

App PWA de suivi de challenge (étirements, postures), avec vue par
semaine/jour, streak, calendrier, stats, favoris, rappel quotidien.

Elle fonctionne **out of the box en mode démo** (sans Supabase) : les
données de progression sont alors stockées dans le localStorage de ton
navigateur. Idéal pour tester avant de tout brancher.

## 1. Tester en local tout de suite (mode démo)

```bash
npm install
npm run dev
```

Ouvre l'URL affichée (en général http://localhost:5173). Tu n'as même
rien à faire pour te connecter : en mode démo, l'app te connecte
automatiquement en tant qu'utilisateur local tant que Supabase n'est
pas configuré.

## 2. Mettre le projet sur GitHub

```bash
cd challenge-app
git init
git add .
git commit -m "Première version de l'app challenge"
```

Puis sur github.com :
1. Crée un nouveau repo vide (sans README, sans .gitignore — tu les as déjà)
2. Copie les commandes affichées, du style :
```bash
git remote add origin https://github.com/TON_PSEUDO/challenge-app.git
git branch -M main
git push -u origin main
```

## 3. Connecter à Netlify

1. Dashboard Netlify → **Add new site → Import an existing project**
2. Choisis **GitHub**, sélectionne ton repo `challenge-app`
3. Netlify détecte Vite automatiquement. Vérifie quand même :
   - **Build command** : `npm run build`
   - **Publish directory** : `dist`
4. Clique **Deploy site**

À ce stade, le site est déjà en ligne en **mode démo** (localStorage).
Pour activer la vraie synchro (compte, multi-device), passe à l'étape 4.

## 4. Créer et connecter Supabase

1. Sur [supabase.com](https://supabase.com), crée un nouveau projet
2. Va dans **SQL Editor → New query**, colle le contenu de
   `supabase/schema.sql`, clique **Run**
3. Fais pareil avec `supabase/seed.sql` pour importer tes 14 séances
   déjà remplies dans le Google Sheet
4. Va dans **Authentication → Providers**, vérifie qu'**Email** est activé
   (c'est le cas par défaut). Pour la connexion par lien magique et la
   réinitialisation de mot de passe, ajoute l'URL du site (locale et Netlify)
   dans **Authentication → URL Configuration → Redirect URLs**.
5. Va dans **Project Settings → API**, récupère :
   - `Project URL` → ce sera `VITE_SUPABASE_URL`
   - `anon public key` → ce sera `VITE_SUPABASE_ANON_KEY`

**En local**, crée un fichier `.env.local` (déjà dans `.gitignore`, ne
sera jamais commité) :
```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJxxxxx...
```
Relance `npm run dev` : l'app bascule automatiquement en mode Supabase
(tu devras créer un compte via le formulaire d'inscription).

**Sur Netlify** :
1. **Site settings → Environment variables → Add a variable**
2. Ajoute les deux mêmes clés (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. Va dans **Deploys → Trigger deploy → Deploy site** pour relancer le
   build avec les nouvelles variables

Chaque `git push` sur `main` redéploiera automatiquement ensuite.

## 5. Ajouter les semaines suivantes

Dans le Google Sheet, continue à remplir les colonnes pour les semaines
3, 4, etc. Quand une nouvelle portion est prête, partage-le à nouveau :
je régénère `src/data/seedData.js` (mode démo) et `supabase/seed.sql`
(mode Supabase — à réexécuter dans le SQL Editor, les `on conflict do
nothing` évitent les doublons).

## 6. Créer / modifier un challenge dans l'app

Depuis l'écran **Challenges → « + Créer un challenge »**. Tu peux ensuite
ajouter des séances (semaine, jour, lien ou ID YouTube, durée, matériel,
consigne), les réordonner et les modifier. Le bouton **Éditer** n'apparaît
que sur tes propres challenges : ceux livrés avec l'app (Marathon 4, etc.)
restent en lecture seule.

- **Mode démo** : tout est stocké dans le `localStorage` du navigateur.
- **Mode Supabase** : exécute une fois `supabase/migration_challenge_editor.sql`
  dans le SQL Editor (ajoute la colonne `owner_id` et les policies
  d'écriture). Une nouvelle base créée avec `supabase/schema.sql` les a déjà.

Les challenges créés dans l'app ne sont visibles que par leur auteur.

### Import en masse (Google Sheet)

Pour charger beaucoup de séances d'un coup, le passage par le Google Sheet
reste possible : partage-le, je régénère `src/data/seedData.js` (démo) et
`supabase/seed.sql` (Supabase, `on conflict do nothing` évite les doublons).

## Structure du projet

```
src/
  data/seedData.js      → données du challenge (mode démo)
  lib/
    supabaseClient.js   → client Supabase (null si non configuré)
    dataService.js       → lecture/écriture (Supabase ou localStorage)
    streak.js            → série en cours + meilleure série
    dateKey.js           → clé de date basée sur l'heure locale (pas UTC)
    theme.js             → préférence clair / sombre / auto
    youtube.js           → extraction de l'ID vidéo depuis une URL
  hooks/
    useAuth.js           → connexion mot de passe / lien magique / reset
    useChallenges.js     → données + création / édition des challenges
    useDailyReminder.js  → notifications locales
  components/            → BreathRing, DayCard, NavBar, StreakBadge,
                           EquipmentCard, HoldTimer, Toast, ErrorBoundary
  pages/                 → Today, Challenges, ChallengePlanning,
                           ChallengeEditor, Session, SessionPlaylist,
                           Calendar, Stats, Favorites, Settings, Login
supabase/
  schema.sql                     → tables + row level security
  migration_challenge_editor.sql → à exécuter sur une base existante
  seed.sql                       → import de tes séances déjà remplies
```

## À propos des vidéos

Les vidéos restent hébergées et diffusées par YouTube (lecteur `iframe`
standard) — l'app ne fait que les référencer par leur ID, comme le
ferait n'importe quel site qui embarque une vidéo YouTube.
