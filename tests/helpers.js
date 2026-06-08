// Helpers partagés par les specs E2E.
// @ts-check

/**
 * Navigue vers l'app dans un état déterministe :
 *  - neutralise le beacon Cloudflare Analytics (corps vide → pas de requête
 *    réseau réelle ni d'erreur console "Failed to load resource" hors-prod) ;
 *  - force la langue via ?lang= (sinon l'app détecte navigator.language, ce qui
 *    rendrait les tests dépendants de l'environnement) ;
 *  - attend optionnellement que le canvas soit rendu à pleine résolution
 *    (RENDER_SIZE = 2000), signal fiable que generateBubble() a tourné.
 *
 * @param {import('@playwright/test').Page} page
 * @param {{ lang?: 'fr'|'en', waitCanvas?: boolean }} [opts]
 */
async function gotoApp(page, { lang = 'fr', waitCanvas = false } = {}) {
  await page.route(/cloudflareinsights\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '' })
  );
  await page.goto(`/?lang=${lang}`);
  if (waitCanvas) {
    await page.waitForFunction(
      () => {
        const c = /** @type {HTMLCanvasElement|null} */ (document.getElementById('canvas'));
        return !!c && c.width >= 2000;
      },
      undefined,
      { timeout: 15_000 }
    );
  }
}

module.exports = { gotoApp };
