import { Page, expect } from '@playwright/test';

// Comptes créés par `npm run prisma:seed` (voir backend/README > section 3).
export const DEMO_ACCOUNTS = {
  reader: { email: 'lecteur@bookverse.cm', password: 'Password123' },
  author: { email: 'auteur@bookverse.cm', password: 'Password123' },
  admin: { email: 'admin@bookverse.cm', password: 'Password123' },
} as const;

export async function loginAs(page: Page, account: keyof typeof DEMO_ACCOUNTS) {
  const { email, password } = DEMO_ACCOUNTS[account];
  await page.goto('/');
  await page.getByRole('button', { name: 'Connexion' }).first().click();
  await page.getByPlaceholder('exemple@email.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  await page.getByRole('button', { name: 'Se Connecter' }).click();
  // On attend la fermeture de la modale (signe que la connexion a réussi) plutôt qu'un
  // délai fixe — plus robuste face à la latence réseau/API.
  await expect(page.getByRole('button', { name: 'Se Connecter' })).toHaveCount(0, { timeout: 8000 });
}
