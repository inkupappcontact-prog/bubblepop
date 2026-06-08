// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { gotoApp } = require('./helpers');

test('export PNG : télécharge un fichier PNG valide > 50 KiB', async ({ page }) => {
  await gotoApp(page, { lang: 'fr', waitCanvas: true });

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#downloadBtn').click();
  const download = await downloadPromise;

  // Nom de fichier attendu : bubblepop-<timestamp>.png
  expect(download.suggestedFilename()).toMatch(/^bubblepop-\d+\.png$/);

  const filePath = await download.path();
  const buf = fs.readFileSync(filePath);

  // Une bulle 2000×2000 rendue pèse bien plus que 50 KiB
  expect(buf.length).toBeGreaterThan(50 * 1024);

  // Signature PNG : 89 50 4E 47 0D 0A 1A 0A — preuve que c'est un vrai PNG
  expect(buf.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
});
