# 2026-08-28 — Mise à niveau « application parfaitement utilisable »

- **Branche** : `chore/app-utilisable-dp` — 3 commits
- **Point de départ** : `2821a56` (`fix(compliance)`, 2026-08-24)
- **Périmètre** : `index.html`, `tests/`, `.gitignore`, `CLAUDE.md`, `README.md`

> **Statut au moment de la rédaction de cette entrée** : les commits de cette
> séance vivent sur une branche **locale**, non poussée sur `origin`. Voir
> « État à la clôture ».

## Objectif

Éliminer tout ce qui, dans l'application, ne fait pas ce qu'il annonce — commande
sans effet, libellé faux, promesse d'interaction non implémentée — et combler les
angles morts d'accessibilité.

## Constat d'audit

Trois familles d'écarts, toutes vérifiées dans le code avant d'écrire le plan.

**1. Des commandes qui ne font rien.**

- Le bouton « ZIP » de la barre d'historique ouvrait une alerte « bientôt
  disponible » (`history.zipSoon`).
- Le bouton « Plus d'options » de l'inspecteur n'avait aucun écouteur.
- Le bandeau d'aperçu annonçait « ⇧ maintenir pour panoramique » alors qu'aucun
  déplacement n'était implémenté : à 200 %, l'image débordait de
  `.preview { overflow: hidden }` et devenait inatteignable.

**2. Des affirmations fausses à l'écran.**

- Le compteur affichait « / 120 caractères » alors que `MAX_TEXT_LEN` et
  l'attribut `maxlength` valaient 500.
- La section « En savoir plus » listait cinq polices dont deux (« Komika Hands »,
  « Anime Ace BB ») ne sont pas celles réellement embarquées.
- Le libellé « Architects Hand » ne correspondait pas à
  `data-font="Architects Daughter"`.

**3. Des angles morts d'accessibilité.**

- La zone de texte n'avait pas de `<label for>` : son seul nom accessible était
  son texte indicatif.
- La modale d'aide déclarait `aria-modal="true"` sans piéger le focus.
- `aria-pressed` de Gras/Italique n'était pas resynchronisé après une annulation
  — l'état annoncé divergeait donc de l'état réel (piège identifié dans
  [ADR-0004](../adr/0004-historique-snapshots-debounce.md)).
- Les erreurs d'export passaient par `alert()` alors qu'un système de toasts
  existait déjà, utilisé seulement par le partage.

S'y ajoutaient deux défauts de rendu : un mot plus long que la zone de texte
sortait de la bulle (`wrapText()` ne coupait jamais à l'intérieur d'un mot), et
les vignettes d'historique n'utilisaient pas la logique de rendu du canevas
principal — un simple `split('\n')`, donc sans retour à la ligne ni ajustement de
taille : elles ne ressemblaient pas au résultat exporté.

## Arbitrages tranchés en séance

| Question | Décision | Motif |
|----------|----------|-------|
| Bouton ZIP inerte | Implémenter un vrai export ZIP | Un bouton visible qui s'excuse coûte plus cher que pas de bouton ; et l'encodeur est écrivable sans dépendance. |
| Panoramique annoncé mais absent | Implémenter le déplacement | À 200 %, l'image est coupée sans recours ; supprimer l'indice aurait laissé le zoom inutilisable. |
| Niveau d'accessibilité visé | Corrections manuelles + tests de bout en bout | Un contrôle automatique seul ne voit ni le piège de focus, ni la cohérence des états ARIA après annulation. |

## Travaux

**Socle.** Extraction d'une fonction de rendu unique `drawBubble(ctx, size, state)`
depuis `generateBubble()`, avec `wrapText()` et `fitText()` prenant désormais le
contexte et l'état en paramètres au lieu de lire des variables globales. Trois
sorties de tailles différentes partagent ce rendu : le canevas principal, les
vignettes d'historique et l'export. C'est ce qui rend les vignettes fidèles au
résultat, sans code dupliqué.

**Export ZIP natif.** Encodeur écrit à la main, conforme à [ADR-0001](../adr/0001-mono-fichier-zero-dependance.md)
(zéro dépendance) : en-têtes locaux `PK\x03\x04`, *central directory* `PK\x01\x02`,
*end of central directory* `PK\x05\x06`, horodatage MS-DOS, table CRC-32 de 256
entrées (polynôme `0xEDB88320`), méthode « stored » — les PNG étant déjà
compressés en interne, une compression ZIP n'apporterait rien. Chaîne
**synchrone** de bout en bout pour conserver le geste utilisateur, même contrainte
que celle documentée sur `doExport()` ([ADR-0002](../adr/0002-traitement-cote-client.md)).
Cas limites traités : historique vide, image de bulle non encore préchargée,
échec de rendu — chacun via un toast, jamais d'exception silencieuse.

**Déplacement de l'aperçu.** État `panX` / `panY` appliqué en
`translate(...) scale(...)`, écouteurs `pointerdown` / `pointermove` / `pointerup`
avec `setPointerCapture` (souris et tactile par le même code). Actif au-delà de
100 % seulement, bornes calées sur le débordement réel pour qu'on ne puisse pas
perdre la bulle hors écran, remise à zéro au retour à 100 %. Le déplacement
n'affecte que l'affichage : ni la génération ni l'export ne le voient.

**Suppressions et corrections de libellés.** Bouton « Plus d'options » retiré
avec sa clé de traduction ; compteur aligné sur 500 ; liste des polices corrigée
partout où elle apparaissait (page, README, blog).

**Accessibilité.** `<label for>` réel sur la zone de texte ; piège de focus dans
la modale (cycle du premier au dernier élément focusable, retour du focus au
déclencheur déjà en place) ; `aria-pressed` ajouté sur les tuiles de style, les
lignes de police et les pastilles de couleur, et **resynchronisé dans
`restoreSnapshot()`** ; lien d'évitement en tête de page ; `role="img"` et
`aria-label` vivant sur le canevas, régénéré après `applyI18n()` avec le texte
réellement dessiné.

**Robustesse du rendu.** `wrapText()` coupe désormais à l'intérieur d'un mot trop
long pour la zone. `alert()` et `confirm()` remplacés par des toasts et une
confirmation en deux temps sur le bouton lui-même. Débordement en mode manuel
signalé dans la zone `role="status"`.

## Vérifications

| Contrôle | Résultat |
|----------|----------|
| Suite Playwright | 16/16 au vert (5 scénarios existants + 5 nouveaux : ZIP, historique, accessibilité, zoom/déplacement, découpage) |
| `html-validate` | Au vert sur les 5 pages racine + `blog/**/*.html` |
| `tools/check-footer.mjs` | Au vert |
| `sitemap.xml` | Bien formé |
| Archive ZIP produite | Ouverte par le module `zipfile` de Python : `testzip()` renvoie `None` (tous les CRC valides), 3 PNG 2000 × 2000 en RGBA à l'intérieur |
| Contrastes | Relevés au navigateur puis corrigés : `--ink-3` était à 2,87:1 en thème clair, le bouton d'export principal à 3,68:1 ; tous ≥ 4,5:1 après correction, dans les deux thèmes |
| Rendu multi-écrans | Captures à 1440, 390 et 360 px, thèmes clair et sombre |

Le contrôle de l'archive ne s'est pas arrêté à la signature `PK` : un fichier
peut porter la bonne signature et rester illisible. C'est le décompresseur strict
qui tranche.

## Écarts trouvés hors plan

- **Sous 600 px, le sélecteur de langue était masqué** et l'en-tête débordait :
  la langue devenait impossible à changer sur mobile. Trouvé au contrôle visuel,
  pas par un test — aucun scénario ne couvrait la largeur mobile. Corrigé,
  l'interface tient sans débordement horizontal dès 360 px.
- **Vignettes d'historique étirées et sans retour à la ligne** : conséquence
  directe du rendu dupliqué, résolue par la factorisation décrite plus haut.

## État à la clôture

- Arbre de travail propre, 3 commits sur `chore/app-utilisable-dp`, tous les
  contrôles au vert.
- **Reste ouvert** : la branche n'a pas été poussée sur `origin`. Tant qu'elle
  reste locale, ce chantier n'existe pas pour le dépôt public — ni dans
  l'historique, ni dans le `CHANGELOG.md`, et il n'est sauvegardé nulle part
  ailleurs que sur le poste de travail. À pousser, puis à fusionner dans `main`
  et à reporter dans la section « Non publié » du `CHANGELOG.md`
  (`node tools/changelog.mjs` produit le brouillon).
- Deux mécanismes supplémentaires sont désormais défendables ligne à ligne au
  même titre que la recherche dichotomique : l'encodeur ZIP (format binaire,
  petit-boutiste, CRC-32 par table, contrainte de synchronicité) et le rendu
  unique partagé par trois sorties de tailles différentes. Ils mériteront chacun
  un ADR à la fusion de la branche.
