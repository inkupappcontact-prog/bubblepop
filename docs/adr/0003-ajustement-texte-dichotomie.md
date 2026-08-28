# ADR-0003 — Ajustement de la taille du texte par recherche dichotomique

- **Statut** : accepté
- **Date** : 2026-05-19
- **Portée** : `fitText()` et `wrapText()` dans `index.html`

## Contexte

Le texte doit occuper la zone creuse de la bulle sans en déborder, quels que
soient sa longueur, la police et le style choisis. Il faut donc trouver la plus
grande taille de police pour laquelle le texte, **une fois découpé en lignes à
cette taille**, tient encore en largeur et en hauteur.

La difficulté est que le découpage dépend de la taille : changer la taille change
le nombre de lignes, donc la hauteur totale. On ne peut pas calculer la taille
directement à partir du nombre de caractères ; il faut essayer, mesurer, ajuster.

Le domaine utile va de 10 à 400 pixels. Un balayage linéaire coûterait jusqu'à
390 découpages complets — chacun appelant `ctx.measureText()` pour chaque mot —
**à chaque frappe au clavier**, l'aperçu étant redessiné en direct.

## Décision

`fitText()` fait une **recherche dichotomique** sur la taille de police. La
propriété qui l'autorise : *si le texte tient à la taille N, il tient à toute
taille inférieure* — la faisabilité est monotone, donc l'intervalle est
partitionné en un préfixe « ça tient » et un suffixe « ça déborde », et on peut
chercher la frontière par bissection.

```js
let lo = 10, hi = 400, best = 10, bestLines = [text];
while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    ctx.font = buildFont(mid, fontFamily);
    const lines = wrapText(text, maxWidth);          // découpage à CETTE taille
    const totalHeight = lines.length * mid * 1.2;
    const maxLineWidth = Math.max(...lines.map(l => ctx.measureText(l).width));
    if (totalHeight <= maxHeight && maxLineWidth <= maxWidth) {
        best = mid; bestLines = lines; lo = mid + 1;  // ça tient : viser plus grand
    } else {
        hi = mid - 1;                                 // ça déborde : viser plus petit
    }
}
```

Le résultat est conservé dans `best` / `bestLines` plutôt que recalculé après la
boucle : le découpage retenu est exactement celui mesuré à la taille retenue.

## Conséquences

- Le nombre d'essais passe de 390 au pire à `log2(391) ≈ 9`, soit un facteur ~40
  sur le nombre de découpages. L'aperçu reste fluide pendant la saisie sans avoir
  à différer le rendu.
- Le coût est indépendant de la longueur du texte à l'échelle de l'intervalle :
  seul `wrapText()` grandit avec le nombre de mots.
- La borne haute (400 px) est aussi celle du mode manuel : les deux modes
  couvrent la même plage, ce qui évite qu'un basculement change la taille.
- Le plancher à 10 px signifie qu'un texte impossible à faire tenir est rendu à
  10 px plutôt que refusé. `wrapText()` doit donc savoir couper à l'intérieur
  d'un mot pour qu'un mot très long ne sorte pas de la bulle.

## Alternatives écartées

| Alternative | Pourquoi non |
|-------------|--------------|
| Balayage linéaire décroissant 400 → 10 | Correct mais jusqu'à 390 découpages par frappe ; visible à la saisie sur une machine modeste. |
| Formule empirique (taille = f(nb caractères)) | Ne tient pas compte de la police ni de la largeur réelle des glyphes ; produit des débordements dès qu'on change de police. |
| Mise à l'échelle CSS d'un rendu à taille fixe | Dégrade la netteté à l'export 2000 × 2000, alors que le PNG net est le produit. |
| Différer le calcul (*debounce*) sur la frappe | Traite le symptôme (le coût) en dégradant l'aperçu direct, qui est l'argument du produit. |

## Vérification

- La zone `role="status"` de l'interface annonce la taille retenue et le nombre
  de lignes : le résultat de l'algorithme est observable sans ouvrir la console.
- Recette manuelle : un texte de 500 caractères (limite `MAX_TEXT_LEN`) et un mot
  unique très long doivent rester dans la bulle, sur les 4 styles et les 5 polices.
