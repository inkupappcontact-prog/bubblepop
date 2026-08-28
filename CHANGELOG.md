# Historique des modifications

Toutes les évolutions notables de BubblePop sont consignées ici.

Le format suit [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/) et le
versionnement suit [SemVer](https://semver.org/lang/fr/). Le projet étant une
application web (et non une bibliothèque), la version majeure est réservée à une
refonte de l'interface ou à une rupture du format des données persistées
(`localStorage`), la mineure à une fonctionnalité visible, le correctif au reste.

Ce fichier est la vue **produit** de l'historique. Deux autres vues le complètent :

| Vue | Où | Répond à la question |
|-----|-----|----------------------|
| Produit | `CHANGELOG.md` (ce fichier) | Qu'est-ce qui a changé pour l'utilisateur, et quand ? |
| Décisions | [`docs/adr/`](docs/adr/) | Pourquoi le code est-il construit ainsi ? |
| Séances de travail | [`docs/journal/`](docs/journal/) | Comment s'est déroulé tel chantier ? |

Le détail ligne à ligne reste dans l'historique Git (`git log`), qui fait foi.
La section « Non publié » se rédige avec `node tools/changelog.mjs` (voir
[CLAUDE.md](CLAUDE.md#historique-des-modifications)).

---

## [Non publié]

### Interne

- Traçabilité des modifications : ce `CHANGELOG.md` (reconstitué depuis les 43
  commits du dépôt), les décisions d'architecture dans `docs/adr/`, le journal
  des séances de travail dans `docs/journal/`, et le générateur de section
  `tools/changelog.mjs` (zéro dépendance, adossé aux Conventional Commits).
- CI : vérification du format des messages de commit dans le workflow `lint`.

---

## [0.5.1] — 2026-08-24

### Modifié

- **Conformité Stripe du volet site.** Le compte Stripe adossé à Ko-fi ayant été
  signalé « activité réglementée », le vocabulaire FR de `support.html` passe de
  « don » à « pourboire » (la sollicitation caritative est une activité
  réglementée, le pourboire à un créateur ne l'est pas — la version EN disait
  déjà « tip »), une section « Remboursements » bilingue est ajoutée (ancre
  `#refunds`, pièce exigée à l'examen Stripe), et les mentions de licence et de
  lien Ko-fi sont alignées.

## [0.5.0] — 2026-06-08

### Ajouté

- **Tests de bout en bout** : suite Playwright (chromium sans interface) sur
  5 scénarios — chargement sans erreur console, export PNG valide, bascule
  FR/EN, thème et sa persistance, annuler/refaire au clavier — et son workflow
  CI dédié (`e2e.yml`).
- **Blog SEO longue traîne** (`/blog/`) : hub bilingue et premier article publié
  en deux versions reliées par `hreflang` (EN `how-to-add-a-speech-bubble-to-an-image`,
  FR `ajouter-une-bulle-de-bd-sur-une-image`), avec JSON-LD `HowTo` +
  `BreadcrumbList`.
- Lien « Blog » dans le footer des 7 pages (maillage interne).

## [0.4.0] — 2026-05-22

### Ajouté

- Titre `H1` sur l'accueil et section éditoriale `/about` (contenu indexable).
- Balise de vérification Bing Webmaster Tools.
- Intégration continue : `html-validate` sur toutes les pages, validation de
  `sitemap.xml`, et `tools/check-footer.mjs` qui compare les liens du footer
  entre les pages (le footer est dupliqué faute de build step — voir
  [ADR-0001](docs/adr/0001-mono-fichier-zero-dependance.md)).

### Modifié

- Images de bulles converties en WebP sans perte (−79 % de poids), servies en
  priorité via `srcset`.
- Redirection des URLs `.html` vers leur forme propre (308).
- Footer commun déployé sur `privacy`, `legal` et `support`.
- Cloudflare Pages devient la cible de déploiement unique (`vercel.json` retiré).

### Corrigé

- `srcset` des vignettes WebP et retrait de `frame-ancestors` de la balise
  `<meta>` CSP (directive ignorée hors en-tête HTTP).

### Sécurité

- `.gitignore` bloque `OPS.md` et `bubblepop-ops/` : les identifiants
  d'administration ne peuvent plus être versionnés par inadvertance.

## [0.3.0] — 2026-05-21

### Ajouté

- Pages `privacy.html` et `legal.html` bilingues FR/EN, avec l'identité légale
  complète de l'éditeur (statut EI + SIREN), et footer global sur tout le site.
- Financement : bouton Ko-fi, `.github/FUNDING.yml` et page `/support` dédiée.

### Modifié

- URLs sans extension pour `/privacy` et `/legal`.

## [0.2.0] — 2026-05-20

### Ajouté

- Page `404.html` bilingue.
- Repère de navigation `<main>` sur le corps de l'application (accessibilité).
- `_redirects` : redirection `www` vers le domaine apex (Cloudflare Pages).

### Modifié

- Chargement des images : vignettes 256 px pour le sélecteur de style et
  chargement paresseux des bulles pleine résolution (5000 × 5000).
- Image Open Graph retravaillée ; `og:title` et `twitter:title` rallongés
  (46 → 53 caractères).
- En-têtes HTTP : `Cross-Origin-Resource-Policy` sur `og-image.png`,
  `Cache-Control` dédié pour `robots.txt` et `sitemap.xml`.
- Scripts Python utilitaires regroupés dans `scripts/`.

## [0.1.0] — 2026-05-19

Première version publique, en ligne sur `getbubblepop.com`.

### Ajouté

- **Générateur de bulles** : 4 styles, 5 polices auto-hébergées, couleur,
  gras/italique, ajustement automatique ou manuel de la taille du texte, export
  PNG 2000 × 2000 à fond transparent. Tout le traitement se fait dans le
  navigateur ([ADR-0002](docs/adr/0002-traitement-cote-client.md)).
- **Interface bilingue FR/EN** (~95 clés) : détection de la langue du navigateur,
  persistance, et paramètre `?lang=` pour un lien direct.
- **Annuler / Refaire** (`Ctrl+Z`, `Ctrl+Shift+Z`, `Ctrl+Y`) par instantanés
  regroupés par délai d'inactivité ([ADR-0004](docs/adr/0004-historique-snapshots-debounce.md)).
- **Historique local** des 9 dernières bulles (`localStorage`, rien ne sort de
  l'appareil).
- Partage natif (Web Share) avec repli sur le presse-papiers, et modale d'aide.
- Thème clair/sombre avec détection des préférences système.
- SEO : `hreflang` bilingue, sitemap multilingue, Open Graph, JSON-LD.
- Mesure d'audience Cloudflare Web Analytics (sans cookie).
- `README.md` et licence CC BY-NC 4.0.

---

[Non publié]: https://github.com/inkupappcontact-prog/bubblepop/compare/v0.5.1...HEAD
[0.5.1]: https://github.com/inkupappcontact-prog/bubblepop/compare/v0.5.0...v0.5.1
[0.5.0]: https://github.com/inkupappcontact-prog/bubblepop/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/inkupappcontact-prog/bubblepop/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/inkupappcontact-prog/bubblepop/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/inkupappcontact-prog/bubblepop/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/inkupappcontact-prog/bubblepop/releases/tag/v0.1.0
