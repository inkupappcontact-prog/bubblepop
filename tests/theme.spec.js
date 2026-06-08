// @ts-check
const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

test('thème : le toggle change data-theme et persiste après rechargement', async ({ page }) => {
  await gotoApp(page, { lang: 'fr' });

  const initial = await page.locator('html').getAttribute('data-theme');
  expect(['dark', 'light']).toContain(initial);

  // Bascule du thème
  await page.locator('#themeToggle').click();
  const toggled = await page.locator('html').getAttribute('data-theme');
  expect(toggled).not.toBe(initial);
  expect(['dark', 'light']).toContain(toggled);

  // Persistance : après reload, le thème basculé est conservé (localStorage)
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', /** @type {string} */ (toggled));
});
