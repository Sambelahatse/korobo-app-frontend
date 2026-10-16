# KOROBO — React TypeScript + Tailwind CSS

Application de suivi de maintenance solaire.

## 🚀 Démarrage rapide

```bash
npm install
npm run dev
```

## 🛠 Stack

- **React 18** + **TypeScript**
- **Tailwind CSS v3** (avec config custom)
- **Vite** (bundler)
- **Google Fonts** : Syne (titres) + DM Sans (corps)

## 📁 Structure

```
src/
├── App.tsx                    # Router principal
├── main.tsx                   # Entry point
├── index.css                  # Tailwind directives + Google Fonts
│
├── types/
│   └── index.ts               # Types partagés (Page, Site, ListItem)
│
├── pages/
│   ├── LandingPage.tsx        # Hero dark + navbar
│   ├── SitesPage.tsx          # Tableau des sites
│   └── PlanificationsPage.tsx # Page planifications
│
└── components/
    ├── AdminLayout.tsx        # Sidebar + header
    ├── Icons.tsx              # Tous les SVG icons
    └── NewSiteModal.tsx       # Wizard 6 étapes
```

## 🎨 Palette Tailwind (tailwind.config.js)

| Classe                  | Valeur      |
|-------------------------|-------------|
| `bg-[#3d6b2a]`          | Vert foncé (boutons, sidebar active) |
| `bg-[#4e8a35]`          | Vert moyen (hover) |
| `text-[#6aad46]`        | Vert clair (accents, titre hero) |
| `bg-[#e8f2e3]`          | Vert pâle (lignes alternées, tags) |
| `bg-[#1e1e1e]`          | Dark background (landing) |
| `bg-[#f0f5ec]`          | Vert très clair (navbar) |
| `bg-[#5a7a4a]`          | Vert moyen (thead tableau) |

## ✨ Fonctionnalités

- **Landing page** — Hero animé avec fade-in, navbar Sign Up/Login
- **Sidebar admin** — 7 icônes SVG, active state, déconnexion
- **Page Sites** — Tableau avec alternance, recherche live, Filter/New site
- **Modal 6 étapes** — Wizard complet avec TagList dynamiques (PV, MTTP, Batteries, Contrôleurs), progress dots
- **Planifications** — Shell vide avec CTA
- **4 placeholders** — Dashboard, Rapports, Base, Paramètres prêts à développer

## 🔐 Connexion Google (Firebase Authentication)

La connexion Google utilise Google Identity Services et Firebase Authentication. Elle nécessite une configuration Firebase/Google avant de fonctionner en production.

1. Créez ou sélectionnez un projet dans la [console Firebase](https://console.firebase.google.com/).
2. Dans **Authentication → Sign-in method**, activez le fournisseur **Google**.
3. Dans **Authentication → Settings → Authorized domains**, ajoutez `sambelahatse.github.io`.
4. Dans [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), créez un identifiant OAuth **Web application** et ajoutez `https://sambelahatse.github.io` aux origines JavaScript autorisées.
5. Dans **GitHub → Settings → Secrets and variables → Actions → Variables**, créez les variables de dépôt suivantes (elles sont des paramètres clients publics, pas des mots de passe) :
   - `VITE_GOOGLE_CLIENT_ID` : l’identifiant OAuth client Google se terminant par `.apps.googleusercontent.com`.
   - `VITE_FIREBASE_API_KEY` : la clé Web de l’application Firebase (Paramètres du projet → Vos applications Web).
6. Relancez le workflow **Deploy frontend to GitHub Pages** dans l’onglet Actions.

Pour le développement local, placez les deux valeurs dans un fichier `.env.local` à la racine (ne commitez pas ce fichier), puis relancez `npm run dev`.

> La connexion valide le jeton Google auprès de Firebase et conserve les jetons dans la session du navigateur. Le dépôt backend `KOROBO_APP` étant encore vide, la protection des API et l’autorisation des rôles côté serveur restent à implémenter avant d’utiliser des données sensibles. La connexion e-mail/mot de passe actuelle est encore une simulation.
