// @ts-check
const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

test("accessibilité : lien d'évitement, nom accessible du champ texte", async ({ page }) => {
  await gotoApp(page, { lang: 'fr', waitCanvas: true });

  // Le lien d'évitement est le tout premier élément focusable de la page.
  await page.keyboard.press('Tab');
  const skip = page.locator('.skip-link');
  await expect(skip).toBeFocused();
  await expect(skip).toHaveAttribute('href', '#mainContent');

  // La zone de saisie est associée à un vrai <label for> (pas au seul placeholder).
  const labelFor = await page.locator('label[for="text"]').textContent();
  expect(labelFor?.trim()).toBe('Texte de la bulle');

  // Le canevas expose une description de ce qu'il dessine réellement.
  await page.locator('#text').fill('Salut la BD');
  await expect(page.locator('#canvas')).toHaveAttribute('role', 'img');
  await expect(page.locator('#canvas')).toHaveAttribute('aria-label', /Salut la BD/);
});

test('accessibilité : le focus reste piégé dans la modale d\'aide', async ({ page }) => {
  await gotoApp(page, { lang: 'fr', waitCanvas: true });

  await page.locator('#helpBtn').click();
  await expect(page.locator('#helpModal')).toBeVisible();

  // Le focus initial est sur le bouton de fermeture.
  await expect(page.locator('#helpCloseBtn')).toBeFocused();

  // Après plusieurs Tab, le focus est toujours DANS la modale.
  for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
  const insideModal = await page.evaluate(() => {
    const modal = document.getElementById('helpModal');
    return !!modal && modal.contains(document.activeElement);
  });
  expect(insideModal).toBe(true);

  // Échap ferme et rend le focus au déclencheur.
  await page.keyboard.press('Escape');
  await expect(page.locator('#helpModal')).toBeHidden();
  await expect(page.locator('#helpBtn')).toBeFocused();
});

test('accessibilité : aria-pressed suit l\'état après une annulation', async ({ page }) => {
  await gotoApp(page, { lang: 'fr', waitCanvas: true });

  // Gras est actif par défaut.
  await expect(page.locator('#boldBtn')).toHaveAttribute('aria-pressed', 'true');

  await page.locator('#boldBtn').click();
  await expect(page.locator('#boldBtn')).toHaveAttribute('aria-pressed', 'false');

  // Ctrl+Z doit restaurer l'état ARIA, pas seulement la classe CSS.
  await page.keyboard.press('Control+z');
  await expect(page.locator('#boldBtn')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#boldBtn')).toHaveClass(/active/);
});
