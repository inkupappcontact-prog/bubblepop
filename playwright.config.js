// @ts-check
// Config Playwright — tests E2E de BubblePop (dev/CI uniquement, hors prod).
// L'app est un HTML statique : on la sert via `python -m http.server` puis on
// pilote un Chromium headless. Aucune dépendance n'est injectée dans index.html.
const { defineConfig, devices } = require('@playwright/test');

const PORT = 8000;
const BASE_URL = `http://localhost:${PORT}`;

// python3 est garanti sur ubuntu-latest (CI) mais absent sur Windows, où la
// commande est `python`. On choisit selon la plateforme.
const serveCommand = process.platform === 'win32'
  ? `python -m http.server ${PORT}`
  : `python3 -m http.server ${PORT}`;

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: true,
  // Empêche un test.only oublié de passer en CI.
  forbidOnly: !!process.env.CI,
  // Un seul retry en CI pour absorber un flake réseau ponctuel ; aucun en local.
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    // Locale fixe → navigator.language déterministe (les tests forcent quand
    // même la langue via ?lang= pour ne dépendre de rien).
    locale: 'fr-FR',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: serveCommand,
    url: BASE_URL,
    // En local on réutilise un serveur déjà lancé (npm run serve) ; en CI on
    // démarre toujours un serveur frais.
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
