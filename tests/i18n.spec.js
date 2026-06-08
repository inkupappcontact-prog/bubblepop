// @ts-check
const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

test('bascule FR → EN : <html lang>, bouton de langue et libellés i18n', async ({ page }) => {
  await gotoApp(page, { lang: 'fr' });

  // État initial : français
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.locator('#langBtn')).toContainText('FR');
  const labelFr = await page.locator('.style-tile-label').first().textContent();

  // Bascule via le bouton de langue (toggle direct FR ↔ EN)
  await page.locator('#langBtn').click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#langBtn')).toContainText('EN');

  // Les libellés textuels ont bien été retraduits (pas seulement les attributs)
  const labelEn = await page.locator('.style-tile-label').first().textContent();
  expect(labelEn).not.toBe(labelFr);

  // Re-bascule → retour au français
  await page.locator('#langBtn').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
});
