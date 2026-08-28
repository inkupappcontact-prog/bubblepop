# ADR-0007 — Encodeur ZIP écrit à la main

- **Statut** : accepté
- **Date** : 2026-08-28
- **Portée** : `CRC_TABLE`, `crc32()`, `dosDateTime()`, `byteWriter()`, `buildZip()`, `dataUrlToBytes()`

## Contexte

L'historique conserve les 9 dernières bulles. Les télécharger une par une est
fastidieux ; le bouton « ZIP » de la barre d'historique promettait cet export mais
affichait une alerte « bientôt disponible ». Une commande visible qui s'excuse
coûte plus cher que pas de commande du tout.

Deux contraintes encadrent la solution.

D'abord [ADR-0001](0001-mono-fichier-zero-dependance.md) : aucune bibliothèque
tierce à l'exécution. Ensuite une contrainte de navigateur, la même que celle
déjà documentée sur `doExport()` ([ADR-0002](0002-traitement-cote-client.md)) :
un téléchargement déclenché par script n'est autorisé que dans le **geste
utilisateur**. Dès qu'une chaîne de traitement passe par un `await`, le geste est
perdu et le navigateur bloque le téléchargement sans erreur visible.

## Décision

Écrire l'encodeur, en visant le sous-ensemble strictement nécessaire du format ZIP.

**Méthode 0 (« stored »), sans compression.** Un PNG contient déjà un flux
DEFLATE : le recompresser coûterait du temps de calcul pour un gain nul, parfois
négatif. On écrit donc les octets tels quels, ce qui supprime du même coup le
besoin d'implémenter DEFLATE — la seule partie réellement coûteuse du format.

**Trois structures, dans l'ordre imposé par la spécification** : un en-tête local
`PK\x03\x04` suivi des données pour chaque fichier, puis un *central directory*
`PK\x01\x02` qui répertorie ces en-têtes avec leur décalage, enfin un *end of
central directory* `PK\x05\x06` qui pointe le début du répertoire. Tous les
entiers sont en petit-boutiste, écrits par un `byteWriter()` qui expose `u16`,
`u32` et `bytes`, et qui tient à jour la longueur courante — c'est elle qui donne
les décalages du répertoire central.

**CRC-32 par table.** Le format impose un CRC par fichier. La table de 256
entrées (polynôme inversé `0xEDB88320`) est calculée une fois au chargement, ce
qui ramène le calcul à un octet par tour de boucle.

**Chaîne entièrement synchrone** : `canvas.toDataURL()` et `atob()` le sont tous
les deux, donc le rendu hors-écran, la conversion en `Uint8Array`, la
construction de l'archive et le déclenchement du téléchargement tiennent dans le
gestionnaire de clic. C'est la contrainte qui structure tout le reste.

## Conséquences

- L'archive est lisible par n'importe quel décompresseur, et pas seulement par
  celui du système : la vérification s'est faite avec un lecteur strict, pas sur
  la seule signature (voir « Vérification »).
- Le poids de l'archive est la somme des PNG, sans surcoût notable. Aucune perte,
  aucun risque de corruption liée à une implémentation DEFLATE maison.
- Le code assume ses limites : pas de ZIP64, donc pas d'archive au-delà de 4 Gio
  ni de plus de 65 535 entrées. L'historique étant plafonné à 9 bulles, la limite
  ne peut pas être atteinte.
- Les noms de fichiers sont encodés en UTF-8 sans positionner le drapeau
  correspondant : acceptable pour des noms `bubblepop-N.png` en ASCII pur.
- Toute évolution de l'export (autre format, compression) se paie en code écrit
  à la main. C'est le prix assumé de la règle zéro dépendance.

## Alternatives écartées

| Alternative | Pourquoi non |
|-------------|--------------|
| JSZip ou fflate via CDN | Interdit par ADR-0001, et ajouterait ~40 Kio de script tiers pour assembler des en-têtes de 30 octets. |
| Implémenter DEFLATE | Beaucoup de code délicat pour compresser des données déjà compressées. |
| Déclencher *n* téléchargements successifs | Les navigateurs bloquent les téléchargements multiples ou les noient sous des demandes de confirmation. |
| Chaîne asynchrone (`await` sur `canvas.toBlob`) | Perd le geste utilisateur : le téléchargement est bloqué sans message d'erreur. |
| Générer l'archive côté serveur | Contraire à ADR-0002 : il faudrait téléverser les images. |

## Vérification

- `tests/zip.spec.js` : l'archive téléchargée est interceptée, sa signature
  d'en-tête local contrôlée, le **nombre d'entrées lu dans l'EOCD** comparé à
  l'attendu, et les noms de fichiers vérifiés. Le cas « historique vide »
  n'émet aucun téléchargement.
- Recette manuelle : l'archive a été ouverte par le module `zipfile` de Python,
  `testzip()` renvoyant `None` — tous les CRC sont bons — et les PNG extraits
  font bien 2000 × 2000 en RGBA. Un fichier peut porter la bonne signature et
  rester illisible : c'est le décompresseur strict qui tranche.
