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
├── robots.txt             # SEO
├── sitemap.xml            # SEO (5 URLs : root, privacy, legal, support)
├── og-image.png           # Image 1200x630 pour Open Graph (partages sociaux)
├── _headers               # Headers HTTP Cloudflare Pages
├── _redirects             # Redirections Cloudflare Pages (www→apex + .html→propre)
├── .htmlvalidate.json     # Config html-validate (lint CI)
├── .gitignore             # Bloque OPS.md / .env / plan d'action.txt / etc.
├── .github/
│   ├── FUNDING.yml        # Liens Ko-fi + GitHub Sponsors
│   └── workflows/
│       └── lint.yml       # CI : html-validate + xmllint sur push main + PR
├── README.md              # Doc publique
├── LICENSE                # Licence (CC BY-NC 4.0)
├── bulles BD/             # Images des bulles (chemin référencé dans index.html — NE PAS RENOMMER)
│   ├── 1.png + 1.webp     # 5000x5000 px — Parole       (.webp servi en priorité)
│   ├── 2.png + 2.webp     # 5000x5000 px — Pensée
│   ├── 3.png + 3.webp     # 5000x5000 px — Murmure
│   ├── 4.png + 4.webp     # Cri (fond rendu transparent)
│   └── thumbs/            # Miniatures 256×256 (.png + .webp) pour le sélecteur de style
├── fonts/                 # Polices auto-hébergées (woff2)
├── tools/                 # Scripts Node utilisés en CI (zéro deps npm)
│   └── check-footer.mjs   # Vérifie la cohérence du footer entre les 4 pages
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
- **Pas de dépendances externes** : aucun CDN, aucun package npm, aucune bibliothèque tierce
- **JavaScript vanilla pur** : pas de jQuery, pas de React, pas de Vue
- **Compatibilité navigateurs modernes** : Chrome, Firefox, Safari, Edge récents
- **Code commenté en français** quand un commentaire est nécessaire (le projet est francophone)

### À éviter
- Ne pas introduire de build step (Webpack, Vite, etc.)
- Ne pas externaliser le CSS ou le JS dans des fichiers séparés
- Ne pas ajouter de backend — l'app doit rester 100% statique
- Ne pas casser la transparence du PNG exporté

### Footer commun (à synchroniser manuellement, CI vérifie)
Le footer est dupliqué dans `index.html`, `privacy.html`, `legal.html`, `support.html`.
Pas de build step → pas de templating possible. Quand le footer change dans `index.html`,
**répercuter le changement dans les 3 autres pages** (CSS + HTML).
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

## CI / Lint

Workflow GitHub Actions `.github/workflows/lint.yml` lancé sur push `main` et PR :

- **html-validate@11** sur les 5 pages (`index.html`, `privacy.html`, `legal.html`, `support.html`, `404.html`)
  — config dans `.htmlvalidate.json`. Désactive les règles d'opinion (boutons sans `type=`,
  styles inline, ARIA redondants…) pour rester sur les régressions **structurelles**
  (balises mal fermées, IDs dupliqués, srcset cassé, attributs invalides).
- **xmllint --noout** sur `sitemap.xml` — détecte un XML cassé avant qu'il n'arrive
  dans Google Search Console / Bing.

Pour tester localement avant push (Node 20+ requis) :

```bash
npx --yes html-validate@11 index.html privacy.html legal.html support.html 404.html
```

## SEO

L'app est référencée sous le nom **BubblePop** avec une stratégie internationale (titres et descriptions en anglais, interface en français pour l'instant).

- **Balises** : title, description, keywords, canonical, Open Graph, Twitter Card, Schema.org JSON-LD (`WebApplication`)
- **Fichiers** : `robots.txt`, `sitemap.xml`, `og-image.png` (1200x630)
- **Favicons** : SVG inline en data-URI (bulle simple)
- **Mots-clés cibles** : "speech bubble generator", "comic bubble", "générateur bulle BD", "transparent PNG"
- **URL canonique** : `https://getbubblepop.com` (déjà appliquée dans `index.html`, `sitemap.xml`, `robots.txt`)

## Communication

L'utilisateur préfère échanger en **français**.
