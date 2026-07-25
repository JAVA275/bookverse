import { defineConfig, devices } from '@playwright/test';

// SÉCURITÉ / PRÉ-REQUIS: ces tests sont des tests d'intégration end-to-end, pas des tests
// unitaires — ils ont besoin du VRAI backend (avec sa base PostgreSQL migrée et seedée)
// en train de tourner à côté, sur l'URL que le frontend appelle (VITE_API_URL, voir .env).
// Playwright ne démarre PAS le backend automatiquement : voir e2e/README.md pour la procédure
// complète (migrate + seed + `npm run dev` côté backend, PUIS ces tests côté frontend).
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // les tests partagent les mêmes comptes de démo seedés → pas de parallélisme
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:5173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    // IMPORTANT: `npm run dev` démarre l'ANCIEN serveur mock/proxy Gemini historique
    // (server.ts, port 3000, base en mémoire) — pas le frontend branché sur le vrai backend.
    // Pour les tests E2E, on veut Vite tout seul, qui appelle le vrai backend via
    // VITE_API_URL (voir .env). Le vrai backend (+ Postgres migrée/seedée) doit déjà
    // tourner séparément sur cette URL avant de lancer ces tests — voir e2e/README.md.
    command: 'npx vite --port 5173',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
