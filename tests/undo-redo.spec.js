// @ts-check
const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

test('undo/redo : annule puis rétablit le changement de style au clavier', async ({ page }) => {
  await gotoApp(page, { lang: 'fr', waitCanvas: true });

  // État initial : tuile "Parole" (bulle 1) active, rien à annuler
  await expect(page.locator('.style-tile[data-bubble="1"]')).toHaveClass(/active/);
  await expect(page.locator('#undoBtn')).toBeDisabled();

  // Change de style → bulle 3 ; le commit (setTimeout 0) active #undoBtn
  await page.locator('.style-tile[data-bubble="3"]').click();
  await expect(page.locator('.style-tile[data-bubble="3"]')).toHaveClass(/active/);
  await expect(page.locator('#undoBtn')).toBeEnabled();

  // Ctrl+Z → retour à la bulle 1
  await page.keyboard.press('Control+z');
  await expect(page.locator('.style-tile[data-bubble="1"]')).toHaveClass(/active/);
  await expect(page.locator('.style-tile[data-bubble="3"]')).not.toHaveClass(/active/);

  // Ctrl+Shift+Z (redo) → revient à la bulle 3
  await page.keyboard.press('Control+Shift+z');
  await expect(page.locator('.style-tile[data-bubble="3"]')).toHaveClass(/active/);
});
