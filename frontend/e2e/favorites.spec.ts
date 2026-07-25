import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

const SEEDED_BOOK_TITLE = "L'Aventure Ambiguë";

test.describe('Favoris', () => {
  test('ajouter un favori persiste après rechargement (et pas seulement en mémoire locale)', async ({
    page,
  }) => {
    await loginAs(page, 'reader');

    const favoriteButton = page.getByTitle('Ajouter aux coups de cœur').first();
    await favoriteButton.click();

    // Le cœur doit passer en rouge/rempli immédiatement (mise à jour optimiste).
    await expect(favoriteButton.locator('svg')).toHaveClass(/text-rose-500/, { timeout: 3000 });

    // Un vrai rechargement de page force un nouvel appel GET /favorites/mine : si le
    // favori n'était que du state local (l'ancien bug), il disparaîtrait ici.
    await page.reload();
    await expect(page.getByTitle('Ajouter aux coups de cœur').first().locator('svg')).toHaveClass(
      /text-rose-500/,
      { timeout: 8000 }
    );

    // On retire le favori pour laisser l'état propre pour les prochains runs de test.
    await page.getByTitle('Ajouter aux coups de cœur').first().click();
    await expect(page.getByTitle('Ajouter aux coups de cœur').first().locator('svg')).not.toHaveClass(
      /text-rose-500/,
      { timeout: 3000 }
    );
  });
});
