// @ts-check
const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

test('rendu : un mot plus long que la bulle est découpé au lieu de déborder', async ({ page }) => {
  await gotoApp(page, { lang: 'fr', waitCanvas: true });

  // 120 caractères sans le moindre espace : impossible à couper sur un espace.
  await page.locator('#text').fill('A'.repeat(120));

  // La zone role="status" annonce la taille retenue et le nombre de lignes.
  const status = page.locator('#status');
  await expect(status).toContainText(/lignes/);

  const lines = Number((await status.textContent())?.match(/·\s*(\d+)\s*lignes/)?.[1] ?? 0);
  expect(lines).toBeGreaterThan(1);

  // Aucun débordement signalé : en taille auto, la dichotomie garantit que ça rentre.
  await expect(status).not.toContainText('déborde');
});

test('rendu : la taille manuelle trop grande signale le débordement', async ({ page }) => {
  await gotoApp(page, { lang: 'fr', waitCanvas: true });

  await page.locator('#text').fill('Un texte de test suffisamment long pour déborder');
  // Décocher « Auto » puis pousser la taille au maximum.
  await page.locator('#autoSize').uncheck();
  await page.locator('#manualSize').fill('400');
  await page.locator('#manualSize').dispatchEvent('input');

  await expect(page.locator('#sizeTag')).toHaveText('Déborde');
  await expect(page.locator('#sizeTag')).toHaveClass(/tag-warn/);
  await expect(page.locator('#status')).toContainText('déborde de la bulle');
});
