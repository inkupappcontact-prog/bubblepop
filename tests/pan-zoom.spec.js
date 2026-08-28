// @ts-check
const { test, expect } = require('@playwright/test');
const { gotoApp } = require('./helpers');

/** Renvoie la matrice de transformation calculée de .canvas-stage. */
async function stageTransform(page) {
  return page.locator('#canvasStage').evaluate((el) => getComputedStyle(el).transform);
}

test('zoom : le déplacement ne devient possible qu\'au-delà de 100 %', async ({ page }) => {
  await gotoApp(page, { lang: 'fr', waitCanvas: true });

  // À 100 %, l'indice de déplacement est masqué et l'aperçu n'est pas « pannable ».
  await expect(page.locator('#zoomVal')).toHaveText('100%');
  await expect(page.locator('#panHint')).toBeHidden();
  await expect(page.locator('.canvas-wrap')).not.toHaveClass(/pannable/);

  await page.locator('#zoomIn').click(); // 125 %
  await expect(page.locator('#zoomVal')).toHaveText('125%');
  await expect(page.locator('.canvas-wrap')).toHaveClass(/pannable/);
  await expect(page.locator('#panHint')).toBeVisible();
});

test('pan : le glisser déplace l\'aperçu, la réinitialisation le recentre', async ({ page }) => {
  await gotoApp(page, { lang: 'fr', waitCanvas: true });

  // 200 % : la bulle déborde de la zone d'aperçu, le déplacement a un sens.
  for (let i = 0; i < 4; i++) await page.locator('#zoomIn').click();
  await expect(page.locator('#zoomVal')).toHaveText('200%');

  const before = await stageTransform(page);

  const box = await page.locator('.canvas-wrap').boundingBox();
  if (!box) throw new Error('.canvas-wrap introuvable');
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + 90, cy + 60, { steps: 8 });
  await page.mouse.up();

  const after = await stageTransform(page);
  expect(after).not.toBe(before);

  // Un clic sur la valeur du zoom remet zoom ET déplacement à zéro.
  await page.locator('#zoomReset').click();
  await expect(page.locator('#zoomVal')).toHaveText('100%');
  await expect(page.locator('.canvas-wrap')).not.toHaveClass(/pannable/);
  // matrix(1, 0, 0, 1, 0, 0) → aucune translation résiduelle.
  expect(await stageTransform(page)).toBe('matrix(1, 0, 0, 1, 0, 0)');
});
