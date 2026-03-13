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
