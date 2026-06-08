// @ts-check
const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

test('la page se charge sans erreur console et rend le canvas', async ({ page }) => {
  const errors = [];
  page.on('console', (msg) => {
    // On ignore le bruit éventuel du beacon Cloudflare (neutralisé par gotoApp).
    if (msg.type() === 'error' && !/cloudflareinsights/.test(msg.text())) {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => errors.push(err.message));

  await gotoApp(page, { lang: 'fr', waitCanvas: true });

  // Éléments clés de l'UI présents
  await expect(page.locator('#text')).toBeVisible();
  await expect(page.locator('#downloadBtn')).toBeVisible();
  await expect(page.locator('.style-tile')).toHaveCount(4);

  // Le canvas a été rendu à pleine résolution (2000×2000)
  const size = await page.locator('#canvas').evaluate(
    (c) => ({ w: /** @type {HTMLCanvasElement} */ (c).width, h: /** @type {HTMLCanvasElement} */ (c).height })
  );
  expect(size).toEqual({ w: 2000, h: 2000 });

  // Aucune erreur JS / console (hors beacon)
  expect(errors).toEqual([]);
});
