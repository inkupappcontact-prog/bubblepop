// @ts-check
const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

test("historique : persiste après rechargement et restaure l'état au clic", async ({ page }) => {
  await gotoApp(page, { lang: 'fr', waitCanvas: true });
  await expect(page.locator('.thumb')).toHaveCount(0);

  // Premier état : bulle 3, texte « Alpha » → export (l'export alimente l'historique).
  await page.locator('.style-tile[data-bubble="3"]').click();
  await page.locator('#text').fill('Alpha');
  let dl = page.waitForEvent('download');
  await page.locator('#downloadBtn').click();
  await dl;

  // Second état : bulle 2, texte « Beta » → export.
  await page.locator('.style-tile[data-bubble="2"]').click();
  await page.locator('#text').fill('Beta');
  dl = page.waitForEvent('download');
  await page.locator('#downloadBtn').click();
  await dl;

  await expect(page.locator('.thumb')).toHaveCount(2);
  await expect(page.locator('#historySub')).toContainText('2 bulles');

  // Rechargement : l'historique vient de localStorage, il doit survivre.
  await gotoApp(page, { lang: 'fr', waitCanvas: true });
  await expect(page.locator('.thumb')).toHaveCount(2);

  // La 2e vignette est l'état le plus ancien (« Alpha », bulle 3) : on le restaure.
  await page.locator('.thumb').nth(1).click();
  await expect(page.locator('#text')).toHaveValue('Alpha');
  await expect(page.locator('.style-tile[data-bubble="3"]')).toHaveAttribute('aria-pressed', 'true');
});

test('historique : le vidage demande une confirmation sur le bouton', async ({ page }) => {
  await gotoApp(page, { lang: 'fr', waitCanvas: true });

  const dl = page.waitForEvent('download');
  await page.locator('#downloadBtn').click();
  await dl;
  await expect(page.locator('.thumb')).toHaveCount(1);

  // Premier clic : le bouton s'arme, rien n'est supprimé.
  await page.locator('#clearHistoryBtn').click();
  await expect(page.locator('#clearHistoryBtn')).toContainText('Confirmer');
  await expect(page.locator('.thumb')).toHaveCount(1);

  // Second clic : vidage effectif.
  await page.locator('#clearHistoryBtn').click();
  await expect(page.locator('.thumb')).toHaveCount(0);
  await expect(page.locator('.history-empty')).toBeVisible();
});
