// @ts-check
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const { gotoApp } = require('./helpers');

/**
 * Lit le nombre d'entrées déclaré dans l'« end of central directory » (EOCD),
 * le dernier bloc d'un ZIP : signature PK\x05\x06 puis, en little-endian,
 * n° de disque (2), disque du central directory (2), entrées sur ce disque (2),
 * total des entrées (2)…
 * @param {Buffer} buf
 */
function readZipEntryCount(buf) {
  const sig = Buffer.from([0x50, 0x4b, 0x05, 0x06]);
  const eocd = buf.lastIndexOf(sig);
  expect(eocd, "signature 'end of central directory' introuvable").toBeGreaterThan(-1);
  return buf.readUInt16LE(eocd + 10);
}

test("export ZIP : archive valide contenant une entrée par bulle de l'historique", async ({ page }) => {
  await gotoApp(page, { lang: 'fr', waitCanvas: true });

  // Deux exports PNG → deux entrées dans l'historique local.
  for (const bubble of ['1', '3']) {
    await page.locator(`.style-tile[data-bubble="${bubble}"]`).click();
    const dl = page.waitForEvent('download');
    await page.locator('#downloadBtn').click();
    await dl;
  }
  await expect(page.locator('.thumb')).toHaveCount(2);

  const downloadPromise = page.waitForEvent('download');
  await page.locator('#exportZipBtn').click();
  const download = await downloadPromise;

  expect(download.suggestedFilename()).toMatch(/^bubblepop-history-\d+\.zip$/);

  const buf = fs.readFileSync(await download.path());

  // Signature d'en-tête local : PK\x03\x04 en tête de fichier.
  expect(buf.subarray(0, 4).toString('hex')).toBe('504b0304');
  // Le central directory déclare bien 2 fichiers.
  expect(readZipEntryCount(buf)).toBe(2);
  // Les deux PNG 2000×2000 stockés sans compression : l'archive est volumineuse.
  expect(buf.length).toBeGreaterThan(100 * 1024);
  // Les noms de fichiers sont présents en clair (méthode « stored »).
  expect(buf.includes(Buffer.from('bubblepop-01.png'))).toBe(true);
  expect(buf.includes(Buffer.from('bubblepop-02.png'))).toBe(true);
});

test('export ZIP : historique vide → message, aucun téléchargement', async ({ page }) => {
  await gotoApp(page, { lang: 'fr', waitCanvas: true });

  await expect(page.locator('.thumb')).toHaveCount(0);
  await page.locator('#exportZipBtn').click();

  await expect(page.locator('#toast')).toHaveClass(/show/);
  await expect(page.locator('#toast')).toContainText('Aucune bulle à exporter');
});
