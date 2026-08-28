# ADR-0008 — Une seule fonction de rendu pour trois sorties

- **Statut** : accepté
- **Date** : 2026-08-28
- **Portée** : `drawBubble()`, `wrapText()`, `fitText()`, `renderThumbnail()`

## Contexte

Trois endroits de l'application dessinent une bulle, à trois tailles et pour trois
usages différents :

| Sortie | Dimensions | Usage |
|--------|-----------|-------|
| Canevas principal | 2000 × 2000 | Aperçu et export PNG |
| Vignette d'historique | 248 × 168 | Rappel visuel des bulles précédentes |
| Canevas hors-écran | 2000 × 2000 | Entrées de l'archive ZIP ([ADR-0007](0007-encodeur-zip-natif.md)) |

Chacun avait sa propre logique. Celle des vignettes se contentait d'un
`split('\n')` : ni retour à la ligne automatique, ni ajustement de la taille de
police, et l'image étirée au format de la vignette. Le résultat ne ressemblait
pas au PNG exporté — une vignette d'historique qui ne montre pas ce qu'on obtient
en cliquant dessus est pire qu'absente.

La cause n'est pas l'inattention : `wrapText()` et `fitText()` lisaient les
variables globales `ctx` et `textStyle`. Elles étaient donc **inutilisables**
ailleurs que sur le canevas principal, et toute autre sortie devait réinventer un
rendu approximatif.

## Décision

Une fonction unique, `drawBubble(c, w, h, state)`, qui prend son contexte, ses
dimensions et l'état à dessiner en paramètres, et qu'appellent les trois sorties.
`wrapText(c, text, maxWidth)` et `fitText(c, text, maxWidth, maxHeight, state)`
sont paramétrées de la même façon : plus aucune lecture de variable globale dans
la chaîne de rendu.

L'image est dessinée « contain » dans un carré centré sur la surface cible. Une
vignette au format 248 × 168 montre donc exactement le cadrage du PNG carré, sans
déformation.

`drawBubble()` renvoie `null` quand l'image de bulle n'est pas encore chargée
(le préchargement est différé) : l'appelant décide quoi faire — réessayer,
afficher un message, ou abandonner l'entrée dans le cas de l'archive.

## Conséquences

- Les vignettes sont fidèles au résultat, par construction et non par
  synchronisation manuelle de deux morceaux de code.
- L'export ZIP a pu être écrit sans une ligne de rendu supplémentaire.
- Une correction de rendu profite d'un coup aux trois sorties : le découpage des
  mots trop longs, ajouté dans `wrapText()`, s'applique aussi bien à l'aperçu
  qu'aux vignettes et à l'archive.
- Le coût est un passage de paramètres plus verbeux là où trois globales
  suffisaient, et une discipline à tenir : toute nouvelle sortie doit passer par
  `drawBubble()`, jamais réimplémenter un rendu « rapide ».
- L'état à dessiner devait de toute façon être un objet sérialisable, puisque
  c'est celui que manipulent l'historique et l'annulation
  ([ADR-0004](0004-historique-snapshots-debounce.md)) : la factorisation
  s'appuie sur une structure qui existait déjà.

## Alternatives écartées

| Alternative | Pourquoi non |
|-------------|--------------|
| Garder deux rendus et les synchroniser à la main | C'est exactement ce qui a produit le défaut : deux logiques divergentes sans rien pour signaler l'écart. |
| Mettre à l'échelle le canevas principal en CSS pour la vignette | Le canevas principal reflète l'état courant, pas l'entrée d'historique à afficher. |
| Stocker un `dataURL` de vignette dans l'historique | Alourdit `localStorage` (quota ~5 Mio) pour neuf images, et fige la vignette si le rendu évolue. |
| Un moteur de rendu générique paramétré par une configuration | Sur-conception pour trois appelants qui diffèrent uniquement par leurs dimensions. |

## Vérification

- Les trois appels sont visibles à la lecture : canevas principal, `renderThumbnail()`
  et la construction de l'archive appellent tous `drawBubble()`.
- `tests/history.spec.js` : une entrée d'historique se restaure fidèlement.
- `tests/wrap.spec.js` : un mot de 120 caractères est découpé au lieu de sortir
  du tracé — correction faite une fois, valable pour les trois sorties.
- Recette manuelle : une vignette et le PNG exporté correspondant montrent le
  même découpage de lignes et la même taille relative de texte.
