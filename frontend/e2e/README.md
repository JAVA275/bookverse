# Tests End-to-End (Playwright)

Ces tests pilotent un vrai navigateur contre l'application réelle (frontend + backend +
PostgreSQL) — ce ne sont **pas** des tests unitaires. Contrairement aux tests
`backend/tests/` (Jest + Supertest, qui tournent en CI avec un Postgres de service), ces
tests ont besoin d'une pile complète déjà démarrée.

## Prérequis avant de lancer `npm run test:e2e`

1. **Backend + base de données** (dans un terminal séparé) :
   ```bash
   cd backend
   cp .env.example .env   # configure DATABASE_URL etc.
   npm install
   npm run prisma:generate
   npm run prisma:migrate:dev
   npm run prisma:seed     # crée admin@bookverse.cm / auteur@bookverse.cm / lecteur@bookverse.cm
   npm run dev              # démarre l'API sur http://localhost:4000
   ```

2. **Frontend configuré pour appeler ce backend** — vérifie que `frontend/.env` contient :
   ```
   VITE_API_URL="http://localhost:4000/api"
   ```

3. **Installer les navigateurs Playwright** (une seule fois) :
   ```bash
   cd frontend
   npm install
   npx playwright install --with-deps chromium
   ```

## Lancer les tests

```bash
cd frontend
npm run test:e2e        # mode headless, rapport HTML en cas d'échec
npm run test:e2e:ui     # mode interactif (recommandé en développement)
```

Playwright démarre lui-même le frontend (`npx vite --port 5173`) — **pas** `npm run dev`,
qui lance l'ancien serveur mock/proxy Gemini historique (`server.ts`, port 3000) au lieu du
vrai frontend branché sur l'API. Voir `playwright.config.ts` pour le détail.

## Ce que couvre la suite actuelle

- `auth.spec.ts` — inscription visiteur → rôle Lecteur forcé, connexion démo, erreur de login
- `catalog-and-reviews.spec.ts` — le catalogue vient bien du backend (pas de données mockées),
  un avis posté est persistant après rechargement
- `favorites.spec.ts` — un favori ajouté survit à un rechargement de page (régression testée :
  ce comportement était cassé — favoris en state local uniquement — avant correction)
- `admin.spec.ts` — création réelle d'une catégorie, chargement de l'onglet Modération

## Limites connues / non couvert pour l'instant

- Parcours de paiement complet (Stripe/PayPal/Orange Money/MTN MoMo) : nécessite de vraies
  clés de test des 4 fournisseurs configurées dans `backend/.env`, non exercé ici.
- Flux abonnement (SubscriptionsView).
- Ces specs n'ont pas encore tourné en conditions réelles dans cet environnement (pas de
  navigateur/Postgres disponibles ici) — à valider avec `npm run test:e2e:ui` en local avant
  de les intégrer à la CI.
