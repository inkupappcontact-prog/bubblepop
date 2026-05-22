#!/usr/bin/env node
// Vérifie que le footer est cohérent sur les 4 pages HTML.
// CLAUDE.md interdit le templating (mono-fichier, pas de build step), donc
// le footer est dupliqué manuellement. Ce script attrape l'oubli humain :
// si un lien est ajouté/retiré dans index.html mais pas répercuté ailleurs,
// le CI échoue.
//
// Stratégie : on compare uniquement les hrefs et leur ordre. Les textes
// diffèrent entre index (data-i18n résolu par JS) et les pages secondaires
// (data-fr/data-en inline), donc on s'en tient au plus stable : les URLs.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const PAGES = ['index.html', 'privacy.html', 'legal.html', 'support.html'];

// On exclut les ancres internes (`#xxx`) : ces liens pointent vers une section
// de la page courante (ex: `#about` n'existe que sur index.html), ils sont par
// nature non-portables entre pages. Le check vérifie les liens externalisables
// (URLs absolues, chemins, mailto:).
function extractFooterHrefs(file) {
  const html = readFileSync(join(ROOT, file), 'utf8');
  const footerMatch = html.match(/<footer[\s\S]*?<\/footer>/i);
  if (!footerMatch) {
    console.error(`✖ ${file}: aucune balise <footer> trouvée`);
    process.exit(2);
  }
  return [...footerMatch[0].matchAll(/<a[^>]+href="([^"]+)"/gi)]
    .map((m) => m[1])
    .filter((href) => !href.startsWith('#'));
}

const results = PAGES.map((page) => ({ page, hrefs: extractFooterHrefs(page) }));
const [canonical, ...rest] = results;

let ok = true;
for (const { page, hrefs } of rest) {
  const sameLength = hrefs.length === canonical.hrefs.length;
  const sameOrder = sameLength && hrefs.every((h, i) => h === canonical.hrefs[i]);
  if (!sameOrder) {
    ok = false;
    console.error(`✖ Footer divergent dans ${page}`);
    console.error(`    ${canonical.page} (${canonical.hrefs.length} liens) :`);
    canonical.hrefs.forEach((h, i) => console.error(`      [${i}] ${h}`));
    console.error(`    ${page} (${hrefs.length} liens) :`);
    hrefs.forEach((h, i) => console.error(`      [${i}] ${h}`));
  }
}

if (!ok) {
  console.error(
    '\nLes liens du footer doivent être identiques (mêmes URLs, même ordre) sur les 4 pages.',
  );
  console.error('Voir CLAUDE.md § "Footer commun (à synchroniser manuellement)".');
  process.exit(1);
}

console.log(
  `✔ Footer cohérent sur ${PAGES.length} pages (${canonical.hrefs.length} liens : ${canonical.hrefs.join(', ')})`,
);
