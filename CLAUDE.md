# CLAUDE.md — BubblePop

Ce fichier fournit le contexte du projet à Claude Code pour ce répertoire.

## Vue d'ensemble

**BubblePop** est une application web statique permettant à l'utilisateur de générer des bulles de BD personnalisées au format PNG. L'utilisateur saisit son texte, choisit un style de bulle et une police, puis télécharge l'image finale avec fond transparent.

- **Nom de marque** : BubblePop
- **Domaine** : `https://getbubblepop.com` (actif sur Cloudflare, déploiement Cloudflare Pages)
- **Cible** : créateurs de contenu et pros (YouTubeurs, illustrateurs, marketeurs, créateurs BD) — public international

## Stack technique

- **HTML5 + CSS3 + JavaScript vanilla** — aucun framework, aucune dépendance externe (npm, bundler, etc.)
- **Canvas API** pour la composition et l'export PNG
- **Application mono-fichier** : tout (HTML + CSS + JS) vit dans `index.html` pour faciliter le déploiement et la maintenance long terme

## Structure du projet

```
app texte bulle/
├── index.html             # Application complète (HTML + CSS + JS inline)
├── privacy.html           # Politique de confidentialité bilingue FR/EN
├── legal.html             # Mentions légales bilingues FR/EN (identité éditeur)
├── support.html           # Page de soutien (Ko-fi + GitHub Sponsors) bilingue FR/EN
├── 404.html               # Page 404 personnalisée
├── blog/                  # SEO long-tail (Phase 5.2) — 1 article = 1 langue = 1 URL
│   ├── index.html         # Hub du blog (bilingue runtime, liste des articles)
│   ├── how-to-add-a-speech-bubble-to-an-image.html  # Article EN (HowTo + BreadcrumbList)
│   └── ajouter-une-bulle-de-bd-sur-une-image.html   # Article FR (pendant hreflang de l'EN)
├── robots.txt             # SEO
├── sitemap.xml            # SEO (7 URLs : root, privacy, legal, support, /blog/ + 2 articles EN/FR)
├── og-image.png           # Image 1200x630 pour Open Graph (partages sociaux)
├── _headers               # Headers HTTP Cloudflare Pages
├── _redirects             # Redirections Cloudflare Pages (www→apex + .html→propre)
├── .htmlvalidate.json     # Config html-validate (lint CI)
├── package.json           # Dev-only : scripts npm + devDep Playwright (la PROD reste 0 dépendance)
├── package-lock.json      # Lockfile des devDeps de test (npm ci en CI)
├── playwright.config.js   # Config tests E2E (sert l'app via python http.server, chromium)
├── .gitignore             # Bloque OPS.md / .env / plan d'action.txt / node_modules / artefacts Playwright
├── .github/
│   ├── FUNDING.yml        # Liens Ko-fi + GitHub Sponsors
│   └── workflows/
│       ├── lint.yml       # CI : html-validate + sitemap + footer + format des commits
│       └── e2e.yml        # CI : tests E2E Playwright (chromium headless, push main + PR)
├── README.md              # Doc publique
├── CHANGELOG.md           # Historique des versions (Keep a Changelog + SemVer)
├── docs/                  # Traçabilité (hors app — jamais servi aux visiteurs)
│   ├── adr/               # Décisions d'architecture (ADR) — immuables, index dans README.md
│   └── journal/           # Journal des séances de travail (1 fichier = 1 séance)
├── LICENSE                # Licence (CC BY-NC 4.0)
├── bulles BD/             # Images des bulles (chemin référencé dans index.html — NE PAS RENOMMER)
│   ├── 1.png + 1.webp     # 5000x5000 px — Parole       (.webp servi en priorité)
│   ├── 2.png + 2.webp     # 5000x5000 px — Pensée
│   ├── 3.png + 3.webp     # 5000x5000 px — Murmure
│   ├── 4.png + 4.webp     # Cri (fond rendu transparent)
│   └── thumbs/            # Miniatures 256×256 (.png + .webp) pour le sélecteur de style
├── fonts/                 # Polices auto-hébergées (woff2)
├── tools/                 # Scripts Node utilisés en CI (zéro deps npm)
│   ├── check-footer.mjs   # Vérifie la cohérence du footer (chrome + blog/*.html auto-découverts)
│   └── changelog.mjs      # Brouillon de section CHANGELOG + --check du format des commits
├── tests/                 # Tests E2E Playwright (dev/CI — 16 scénarios, chromium headless)
│   ├── helpers.js         # gotoApp() : neutralise le beacon CF, force ?lang=, attend le canvas
│   ├── smoke.spec.js      # chargement sans erreur console + canvas 2000×2000
│   ├── export.spec.js     # download d'un PNG valide > 50 KiB (signature PNG)
│   ├── i18n.spec.js       # bascule FR/EN (<html lang> + libellés)
│   ├── theme.spec.js      # toggle data-theme + persistance après reload
│   ├── undo-redo.spec.js  # Ctrl+Z / Ctrl+Shift+Z sur le sélecteur de style
│   ├── zip.spec.js        # archive ZIP valide (signature PK, EOCD, noms) + cas vide
│   ├── history.spec.js    # persistance localStorage + restauration + vidage 2 clics
│   ├── a11y.spec.js       # skip link, label du textarea, piège de focus, aria-pressed
│   ├── pan-zoom.spec.js   # pan actif > 100 %, glisser, réinitialisation
│   └── wrap.spec.js       # mot trop long découpé + alerte de débordement en manuel
└── scripts/               # Scripts Python utilitaires (hors prod)
    ├── make_og_image.py             # Génère og-image.png
    ├── make_transparent.py          # Rend le blanc transparent dans un PNG
    ├── make_bubble_thumbs.py        # Génère bulles BD/thumbs/*.png (256×256)
    └── convert_bubbles_to_webp.py   # Convertit PNG → WebP lossless (-79%)
```

Note : `plan d'action.txt` (stratégie produit/SEO) et `OPS.md` (credentials admin) vivent
**hors du repo** (gitignored). L'`OPS.md` se trouve dans `~/Documents/bubblepop-ops/`.

## Fonctionnalités

### Interface utilisateur
- Textarea pour la saisie du texte
- Sélecteur de style de bulle (4 options avec aperçu)
- Sélecteur de police (5 polices)
- Bouton "Générer PNG"
- Aperçu en temps réel
- Bouton de téléchargement du PNG

### Traitement des images
- Charger les 4 images de bulles depuis `bulles BD/`
- Redimensionner proportionnellement la bulle selon la longueur du texte
- Superposer le texte centré dans la zone de texte de la bulle
- Exporter un PNG avec **fond transparent** autour de la bulle

### Rendu : une seule fonction pour trois sorties
`drawBubble(ctx, w, h, state)` dessine une bulle dans **n'importe quel** contexte 2D :
le canevas principal (2000×2000), les vignettes de l'historique (248×168) et les
canevas hors-écran de l'export ZIP. L'image est cadrée « contain » dans un carré
centré, donc une vignette est fidèle au PNG exporté. `wrapText` / `fitText` prennent
le contexte et l'état en paramètres — aucune lecture de globale, c'est ce qui rend
le partage possible. Un mot plus large que la zone est découpé caractère par
caractère (`breakLongWord`) pour ne jamais déborder du tracé.

### Export ZIP de l'historique
Encodeur ZIP **écrit à la main** dans `index.html` (aucune bibliothèque, règle
0-dépendance en prod) : en-tête local `PK 03 04` + données, *central directory*
`PK 01 02`, *end of central directory* `PK 05 06`, le tout en little-endian,
méthode 0 (« stored » — les PNG sont déjà compressés). CRC-32 par table de 256
entrées (polynôme `0xEDB88320`), horodatage MS-DOS. Chaque bulle est re-rendue via
`drawBubble` puis convertie avec `toDataURL` + `atob` : **toute la chaîne reste
synchrone** pour conserver le geste utilisateur (même contrainte que `doExport`).
Seul chemin asynchrone : une image de bulle pas encore préchargée → chargement puis
relance de l'export.

### Zoom et déplacement (pan)
Le zoom (25–200 %) et le déplacement sont **purement visuels** : ils s'appliquent en
`transform` sur `.canvas-stage`, jamais au rendu. Le PNG exporté reste 2000×2000
quel que soit l'état de l'aperçu. Le pan n'est actif qu'au-delà de 100 %, borné à
l'amplitude réelle du débordement, et implémenté en Pointer Events (souris, stylet
et tactile avec le même code). Clic sur la valeur du zoom = remise à zéro.

### Gestion du texte
- Centrage automatique (horizontal + vertical) dans la zone de texte de la bulle
- Ajustement dynamique de la taille de police selon la taille de la bulle
- Retours à la ligne automatiques (word-wrap sur Canvas)

## Polices intégrées

5 polices exposées à l'utilisateur dans le sélecteur de police, + Inter pour l'UI.

| Police                | Fichier (`fonts/`)                | Usage typique          |
|-----------------------|------------------------------------|------------------------|
| Comic Relief          | `comic-relief-400.woff2` + `-700`  | Texte BD standard      |
| Bangers               | `bangers-400.woff2`                | Titres / cris          |
| Komika Axis           | `komika-axis-400.woff`             | Texte BD classique     |
| Architects Daughter   | `architects-daughter-400.woff2`    | Style manuscrit        |
| Permanent Marker      | `permanent-marker-400.woff2`       | Feutre / marqueur      |
| Inter (UI uniquement) | `inter-var.woff2`                  | Interface (non exposé) |

Toutes les polices sont chargées via `@font-face` dans le CSS inline d'`index.html`.

## Règles de développement

### À faire
- **Conserver le mono-fichier** : tout le HTML, CSS et JS doit rester dans `index.html`
- **Pas de dépendances externes en prod** : aucun CDN, aucun package npm, aucune bibliothèque tierce
  servis à l'utilisateur. ⚠️ Cette règle vise le **runtime** (`index.html` et les pages servies).
  L'outillage de **dev/CI** a le droit d'avoir des devDependencies : `package.json` + `tests/`
  (Playwright E2E) en sont — ne pas les supprimer en croyant « respecter le 0-dépendance ».
- **JavaScript vanilla pur** : pas de jQuery, pas de React, pas de Vue
- **Compatibilité navigateurs modernes** : Chrome, Firefox, Safari, Edge récents
- **Code commenté en français** quand un commentaire est nécessaire (le projet est francophone)

### Accessibilité (compétence évaluée — ne pas régresser)
- Tout contrôle à bascule (tuile de style, ligne de police, pastille de couleur,
  gras/italique) porte `aria-pressed`, écrit par `setPressed()` **en même temps** que la
  classe `.active`. `restoreSnapshot()` repasse par `markStyleTile` / `markFontRow` /
  `setPressed` : sans ça, l'état annoncé divergerait après une annulation.
- La modale d'aide piège le focus (`trapModalFocus` sur Tab) et rend le focus au
  déclencheur à la fermeture.
- Lien d'évitement `.skip-link` en premier élément focusable, cible `#mainContent`.
- Le canevas porte `role="img"` et un `aria-label` régénéré à chaque rendu avec le
  texte réellement dessiné (appliqué **après** `applyI18n`, qui réécrit l'attribut).
- Contrastes vérifiés ≥ 4.5:1 dans les deux thèmes. Trois tokens sont dédiés à ça :
  `--ink-3` (texte secondaire), `--accent-ink` (accent utilisé comme **texte**) et
  `--accent-strong` (bleu portant du texte blanc). Ne pas remettre `--accent` brut
  en `color:` sur du texte : il plafonne à 3.7:1.
- Plus de `alert()` ni `confirm()` : erreurs via `showToast(msg, ms, isError)`
  (`role="alert"`), vidage de l'historique en confirmation deux clics sur le bouton.

### À éviter
- Ne pas introduire de build step (Webpack, Vite, etc.)
- Ne pas externaliser le CSS ou le JS dans des fichiers séparés
- Ne pas ajouter de backend — l'app doit rester 100% statique
- Ne pas casser la transparence du PNG exporté
- **Ne pas laisser de commande sans effet dans l'interface** (bouton sans écouteur,
  fonctionnalité « bientôt disponible », indice décrivant un geste non implémenté) :
  soit on l'implémente, soit on la retire.
- Ne pas laisser diverger l'interface et la réalité (compteur de caractères, liste
  des polices, dimensions annoncées) : ce sont les premières choses vérifiées.

### Footer commun (à synchroniser manuellement, CI vérifie)
Le footer est dupliqué dans `index.html`, `privacy.html`, `legal.html`, `support.html`
**et chaque page de `blog/`** (hub + articles). Pas de build step → pas de templating possible.
Quand le footer change dans `index.html`, **répercuter le changement dans toutes les autres
pages** (CSS + HTML). Liens actuels (ordre, hors ancres internes) : `/blog/`, `/privacy`,
`/legal`, GitHub, `/support`, `mailto:`.
Variantes :
- `index.html` utilise i18n `data-i18n` (objet `I18N` + `applyI18n()`) et la variable CSS `--ink-3`.
- Les 3 autres pages utilisent i18n `data-fr`/`data-en` (script inline qui setInnerHTML) et `--ink-2`.
- Le lien de la page courante porte `aria-current="page"` (style désactivé via le sélecteur d'attribut).

Filet de sécurité : `tools/check-footer.mjs` (exécuté en CI) extrait les `href` du footer
de chaque page et vérifie qu'ils sont identiques (mêmes URLs, même ordre). Les ancres
internes (`#xxx`) sont exclues car non-portables. Si tu ajoutes un lien dans `index.html`
sans le répercuter, le CI échoue. Tester en local avec `node tools/check-footer.mjs`.

## Déploiement

**Déploiement actuel** : Cloudflare Pages (`bubblepop.pages.dev`, domaine cible `getbubblepop.com`).
Le build lit `_headers` (sécurité + cache) et `_redirects` (www→apex, normalisation `.html`).

L'app étant un HTML statique, elle reste portable : GitHub Pages, n'importe quel hébergement
classique, etc. Aucune configuration serveur requise.

**⚠️ Vérification post-déploiement** : Cloudflare cache agressivement les pages HTML.
Après chaque commit qui touche au HTML/SEO (titre, meta, canonical, sitemap, footer),
**vérifier le rendu en navigation privée** (skip cache navigateur + skip cache CF côté visiteur)
sur `getbubblepop.com` (et non sur `bubblepop.pages.dev` qui est squatté — cf. memory).
Si besoin de purger le cache CF : dashboard Cloudflare → Caching → Purge Everything.

## CI / Lint / Tests

Deux workflows GitHub Actions sur push `main` et PR (Node 22) :

**`.github/workflows/lint.yml`** :
- **html-validate@11** sur les 5 pages racine (`index.html`, `privacy.html`, `legal.html`,
  `support.html`, `404.html`) **+ tous les articles `blog/**/*.html`** (glob expansé par
  html-validate → un nouvel article est linté sans toucher le workflow).
  Config dans `.htmlvalidate.json`. Désactive les règles d'opinion (boutons sans `type=`,
  styles inline, ARIA redondants…) pour rester sur les régressions **structurelles**
  (balises mal fermées, IDs dupliqués, srcset cassé, attributs invalides). ⚠️ La règle
  `long-title` reste active : titre ≤ 70 caractères.
- **sitemap.xml** validé via `python3` (`xml.etree.ElementTree.parse`) — détecte un XML cassé
  avant qu'il n'arrive dans Google Search Console / Bing (`xmllint` n'est pas garanti sur le runner).
- **check footer** : `node tools/check-footer.mjs` (cohérence des liens entre toutes les pages
  porteuses du footer : chrome + `blog/*.html` auto-découverts via `globSync`).
- **format des commits** : `node tools/changelog.mjs --check` (Conventional Commits). ⚠️ Cette
  étape exige l'historique Git : le `checkout` du workflow est en `fetch-depth: 0`. Sans tag
  dans le dépôt, le contrôle porte sur les 50 derniers commits.

**`.github/workflows/e2e.yml`** :
- **Playwright** (chromium headless) sur les 16 scénarios de `tests/` : chargement sans erreur
  console, export PNG, export ZIP (archive réellement valide), historique persistant,
  accessibilité clavier, zoom/pan, retour à la ligne, i18n FR/EN, thème, undo/redo.
- L'app statique est servie par `python3 -m http.server` (piloté par `playwright.config.js`,
  qui bascule sur `python` en local Windows). `CI=true` → 1 retry + rapport HTML en artefact.

Pour tester localement avant push (Node 20+ requis) :

```bash
# Lint HTML (inclut les articles de blog via le glob)
npx --yes html-validate@11 index.html privacy.html legal.html support.html 404.html "blog/**/*.html"

# Tests E2E (la 1re fois : npm install puis npx playwright install chromium)
npm test
```

## Historique des modifications

Quatre supports, quatre questions distinctes. Ne pas les mélanger : c'est ce qui les
rend consultables.

| Support | Question | Rythme |
|---------|----------|--------|
| `git log` | Qu'est-ce qui a changé, ligne à ligne ? | Chaque commit |
| `CHANGELOG.md` | Qu'est-ce qui a changé pour l'utilisateur ? | Chaque version |
| `docs/adr/` | Pourquoi le code est-il construit ainsi ? | Chaque décision structurante |
| `docs/journal/` | Comment s'est déroulé tel chantier ? | Chaque séance notable |

**Le `git log` fait foi.** Les trois autres en sont des vues : ils se reconstituent
depuis les commits, l'inverse est faux. D'où la règle sur les messages.

### Messages de commit

Format [Conventional Commits](https://www.conventionalcommits.org/fr/) —
`type(portée): description`, types acceptés : `feat`, `fix`, `docs`, `style`,
`refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`. Vérifié en CI par
`node tools/changelog.mjs --check`.

Le **corps** du message porte le *pourquoi* : ce que le commit répare, ce qui a été
mesuré, ce qui a été écarté. C'est ce qui rend le `CHANGELOG` rédigeable des mois
plus tard (cf. `2821a56`, qui explique le motif de rejet Stripe). Une rupture de
compatibilité se signale par `!` après la portée ou par un pied `BREAKING CHANGE:`.

### Publier une version

```bash
node tools/changelog.mjs            # brouillon groupé depuis le dernier tag
```

Le script **ne modifie pas** `CHANGELOG.md` : il imprime un brouillon à relire. Un
message de commit s'adresse à un développeur, une ligne de CHANGELOG à un
utilisateur — la reformulation est le travail qui reste. Les commentaires HTML
`<!-- hash -->` de la sortie servent au tri, ils se retirent avant de coller.

1. Coller la section relue sous `## [Non publié]` dans `CHANGELOG.md`, la renommer
   `## [X.Y.Z] — AAAA-MM-JJ`, et rouvrir une section `## [Non publié]` vide.
2. Ajouter le lien de comparaison en bas de fichier.
3. `git commit -m "chore(release): version X.Y.Z"`
4. `git tag -a vX.Y.Z -m "vX.Y.Z"` puis `git push --follow-tags`
5. Créer la *release* GitHub sur le tag, en collant la section du CHANGELOG.

Le tag est ce qui borne la plage lue par `changelog.mjs` : sans tag, le script
remonte les 50 derniers commits.

**Versionnement** : majeure pour une refonte de l'interface ou une rupture du format
persisté dans `localStorage` ; mineure pour une fonctionnalité visible ; correctif
pour le reste.

### Quand écrire un ADR

Quand la décision est **coûteuse à revenir** ou **surprenante à la lecture du code**.
Un ADR est immuable une fois accepté : s'il devient faux, on en écrit un nouveau qui
le remplace, on ne réécrit pas l'ancien. Procédure et modèle dans
`docs/adr/README.md`. Référencer l'ADR dans le commit qui applique la décision.

### Quand écrire une entrée de journal

Après une séance qui a produit autre chose que du code : un audit, des arbitrages,
des mesures, des défauts trouvés hors du plan initial. **Technique uniquement** — pas
d'identifiants, pas de chemins de poste de travail, pas de données personnelles : le
dépôt est public, le contexte privé reste dans `~/Documents/bubblepop-ops/`.

## SEO

L'app est référencée sous le nom **BubblePop** avec une stratégie internationale (titres et descriptions en anglais, interface en français pour l'instant).

- **Balises** : title, description, keywords, canonical, Open Graph, Twitter Card, Schema.org JSON-LD (`WebApplication`)
- **Fichiers** : `robots.txt`, `sitemap.xml`, `og-image.png` (1200x630)
- **Favicons** : SVG inline en data-URI (bulle simple)
- **Mots-clés cibles** : "speech bubble generator", "comic bubble", "générateur bulle BD", "transparent PNG"
- **URL canonique** : `https://getbubblepop.com` (déjà appliquée dans `index.html`, `sitemap.xml`, `robots.txt`)

## Blog (`/blog/`) — SEO long-tail (Phase 5.2)

Mini-articles « How-to » statiques pour capter la recherche long-tail (créateurs de
thumbnails, mèmes, webcomics). Dossier `blog/` : un fichier HTML par article + `index.html` (hub).

**Règle d'or : 1 article = 1 langue = 1 URL.** Contrairement aux pages utilitaires
(privacy/legal/support) qui *swappent* FR/EN au runtime via `data-fr`/`data-en`, le **contenu
d'un article est en dur dans le HTML servi** (pas d'injection JS). Raison SEO : Google indexe le
HTML rendu ; un article dont le but *est* le référencement doit être crawlable directement.
Les variantes FR/EN d'un même sujet sont **deux fichiers distincts** reliés par `hreflang`
réciproques (ex. l'EN `how-to-add-a-speech-bubble-to-an-image` ↔ le FR
`ajouter-une-bulle-de-bd-sur-une-image`, + un lien de bascule visible dans le `.meta`). Le seul script
inline d'un article gère **uniquement le thème** (dark/light), pas la langue (`<html lang>` figé).

Le **hub `blog/index.html`** est l'exception : bilingue runtime (comme la home), lit `?lang=`
puis `localStorage['bubblepop:lang']`. Il liste les articles en cartes (titre dans la langue
native + badge `EN`/`FR`).

**Anatomie d'un article** (modèle : `how-to-add-a-speech-bubble-to-an-image.html`) :
- `<head>` SEO complet : `title` (**≤ 70 car.**, règle `long-title`), `description`, `keywords`,
  `canonical` extensionless, `hreflang` (en + x-default ; ajouter `fr` quand la variante existe),
  Open Graph (`og:type=article`), Twitter Card, JSON-LD **`HowTo` + `BreadcrumbList`** (dans un `@graph`).
- CSS inline calqué sur les pages secondaires (mêmes variables, `--ink-2`) + bits article
  (breadcrumb, `ol.steps`, FAQ, CTA). OG image : `og-image.png` générique réutilisée.
- **Footer commun** identique aux pages racine, lien `/blog/` inclus (synchronisé, vérifié par `check-footer.mjs`).

**Checklist pour ajouter un article** :
1. Créer `blog/<slug-riche-en-mots-clés>.html` (copier un article existant comme modèle).
2. `_redirects` : ajouter `/blog/<slug>.html  /blog/<slug>  308` (normalisation extensionless).
3. `sitemap.xml` : ajouter l'URL `/blog/<slug>` (`lastmod` du jour) ; relier les paires FR/EN
   par `<xhtml:link hreflang>` croisés quand les deux existent.
4. `blog/index.html` : ajouter une carte dans `.post-list`.
5. Le lint (`html-validate "blog/**/*.html"`) et `check-footer.mjs` couvrent le nouvel article
   **automatiquement** (globs) — pas de workflow à modifier.
6. Vérifier localement : `node tools/check-footer.mjs` + lint HTML + parse JSON-LD.

## Communication

L'utilisateur préfère échanger en **français**.
