import { test, expect } from '@playwright/test';

// Ces tests supposent que le backend (+ Postgres migrée et seedée via
// `npm run prisma:seed`) tourne déjà séparément — voir e2e/README.md.

test.describe('Authentification', () => {
  test('un visiteur peut créer un compte et obtient le rôle Lecteur par défaut', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Connexion' }).first().click();

    await page.getByRole('button', { name: 'Créer un Compte' }).click();

    const uniqueEmail = `e2e.reader.${Date.now()}@example.com`;
    await page.getByPlaceholder('ex. Koffi Mensah').fill('Testeur E2E');
    await page.getByPlaceholder('koffi@example.com').fill(uniqueEmail);
    await page.getByPlaceholder('••••••••').fill('MotDePasseSolide123!');
    await page.getByPlaceholder('Sénégal, CI, Cameroun...').fill('Sénégal');
    await page.getByPlaceholder('+221 77 000 00 00').fill('+221770000001');

    await page.getByRole('button', { name: "S'inscrire comme Lecteur" }).click();

    // Message de succès de l'inscription, puis fermeture automatique de la modale.
    await expect(page.getByText('Compte Lecteur Créé !')).toBeVisible();

    // Un compte fraîchement créé doit être sur le rôle Lecteur (jamais Auteur/Admin) —
    // c'est la garantie backend testée ici depuis l'UI.
    await expect(page.getByText('Rôle: Lecteur')).toBeVisible({ timeout: 5000 });
  });

  test('le lecteur de démo peut se connecter via le raccourci de démo', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Connexion' }).first().click();

    // Le mode "Connexion" (login) est celui affiché par défaut à l'ouverture de la modale.
    await page.getByRole('button', { name: 'Lecteur Démo' }).click();
    await page.getByRole('button', { name: 'Se Connecter' }).click();

    await expect(page.getByText('Rôle: Lecteur')).toBeVisible({ timeout: 5000 });
  });

  test('un identifiant invalide affiche une erreur claire, pas un crash', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Connexion' }).first().click();

    await page.getByPlaceholder('exemple@email.com').fill('inconnu@example.com');
    await page.getByPlaceholder('••••••••').fill('mauvais-mot-de-passe');
    await page.getByRole('button', { name: 'Se Connecter' }).click();

    await expect(page.getByText(/incorrect|Échec/i)).toBeVisible({ timeout: 5000 });
  });
});
