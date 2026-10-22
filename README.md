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

## 🔐 Authentification (API KOROBO + Neon PostgreSQL)

L’authentification est gérée par l’API KOROBO. Les profils, hash de mots de passe et jetons temporaires sont stockés dans Neon PostgreSQL. La connexion Google passe par l’API, qui vérifie l’adresse Google puis recherche un compte KOROBO actif dans Neon. Google ne stocke pas les profils KOROBO et ne décide pas des rôles. Le navigateur conserve uniquement un jeton d’accès de durée limitée. Aucun identifiant de base de données ni secret serveur ne doit être exposé dans le frontend.

### Configuration locale

Créer un fichier `.env.local` sans le committer :

```dotenv
VITE_API_URL=http://localhost:3000
```

Pour la production, configurer `VITE_API_URL` dans l’environnement de build du frontend et configurer `DATABASE_URL`, `JWT_SECRET`, le service SMTP et `FRONTEND_URL` dans l’environnement de l’API.

### Premier propriétaire

L’inscription initiale utilise `POST /auth/bootstrap-owner` et le jeton de configuration transmis par l’administrateur technique. Après la création du premier compte, retirer `OWNER_BOOTSTRAP_TOKEN` de l’environnement de l’API. Les utilisateurs suivants doivent être invités par un administrateur. Les invitations et réinitialisations nécessitent un service SMTP configuré.

### Migration des comptes existants

Les anciens profils sont conservés, mais les mots de passe Supabase ne sont pas accessibles à l’API et ne peuvent pas être migrés en clair. Les utilisateurs existants devront utiliser le parcours de réinitialisation ou être réinvités pour définir un nouveau mot de passe.
