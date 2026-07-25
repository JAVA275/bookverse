import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

// Titre du livre créé par `npm run prisma:seed` (voir backend/prisma/seed.ts).
// Si ce livre n'apparaît PAS dans le magasin, c'est le signe que le frontend est
// retombé sur des données mockées au lieu du vrai catalogue (voir BookContext.tsx).
const SEEDED_BOOK_TITLE = "L'Aventure Ambiguë";

test.describe('Catalogue & Avis', () => {
  test('le magasin affiche le vrai catalogue depuis le backend (pas les données mockées)', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByAltText(SEEDED_BOOK_TITLE)).toBeVisible({ timeout: 10000 });
  });

  test('un lecteur connecté peut laisser un avis, qui est bien persistant après rechargement', async ({
    page,
  }) => {
    await loginAs(page, 'reader');

    await page.getByAltText(SEEDED_BOOK_TITLE).click();
    await page.getByRole('button', { name: /Avis & Notes/ }).click();

    const comment = `Avis de test E2E — ${Date.now()}`;
    await page.getByPlaceholder("Qu'avez-vous pensé de cet ouvrage ?").fill(comment);
    await page.getByRole('button', { name: 'Publier mon avis' }).click();

    await expect(page.getByText(comment)).toBeVisible({ timeout: 8000 });

    // On ferme et rouvre le livre : si l'avis vient bien de l'API (GET /reviews) et non
    // d'un simple state React local, il doit toujours être là.
    await page.keyboard.press('Escape').catch(() => {});
    await page.reload();
    await page.getByAltText(SEEDED_BOOK_TITLE).click();
    await page.getByRole('button', { name: /Avis & Notes/ }).click();
    await expect(page.getByText(comment)).toBeVisible({ timeout: 8000 });
  });
});
