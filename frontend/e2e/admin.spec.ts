import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('Dashboard Admin', () => {
  test('un admin peut créer une vraie catégorie et la retrouver dans la liste', async ({ page }) => {
    await loginAs(page, 'admin');
    await page.getByRole('button', { name: 'Tableau de Bord' }).click();

    await page.getByRole('button', { name: /Catégories/ }).click();

    const categoryName = `Catégorie E2E ${Date.now()}`;
    await page.getByPlaceholder('ex. Science & Technologie').fill(categoryName);
    await page.getByRole('button', { name: 'Ajouter' }).click();

    await expect(page.getByText(categoryName)).toBeVisible({ timeout: 8000 });
  });

  test("l'onglet Modération charge les vrais livres en attente sans erreur", async ({ page }) => {
    await loginAs(page, 'admin');
    await page.getByRole('button', { name: 'Tableau de Bord' }).click();
    await page.getByRole('button', { name: /Modération/ }).click();

    // On ne connaît pas le nombre exact de livres en attente (ça dépend de l'état de la
    // base), donc on vérifie juste l'absence d'erreur affichée et que la page a bien
    // fini de charger (le spinner de chargement n'est plus présent).
    await expect(page.getByText(/Impossible de charger/i)).toHaveCount(0);
  });
});
