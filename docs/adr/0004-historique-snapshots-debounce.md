# ADR-0004 — Annuler/refaire par instantanés regroupés par inactivité

- **Statut** : accepté
- **Date** : 2026-05-19
- **Portée** : `queueSnapshot()`, `commitSnapshot()`, `restoreSnapshot()`

## Contexte

L'application doit offrir `Ctrl+Z` / `Ctrl+Shift+Z` / `Ctrl+Y`. Deux familles de
solutions existent : enregistrer les **commandes** (chaque action sait s'annuler
elle-même) ou enregistrer des **instantanés** de l'état complet.

Question annexe mais décisive : la frappe au clavier. Un instantané par caractère
saisi rendrait `Ctrl+Z` inutilisable — annuler « Bonjour » demanderait sept
annulations.

## Décision

**Instantanés d'état complet**, empilés dans deux piles (`undo` / `redo`),
plafonnées à 50 entrées.

L'état d'une bulle tient dans un objet plat : texte, style, police, couleur,
gras, italique, ajustement automatique, taille manuelle. Le copier entier coûte
moins qu'un octet de complexité : il n'y a pas d'opération inverse à écrire, donc
pas de couple `do`/`undo` à maintenir synchronisé pour chaque nouvelle commande.

**Regroupement par délai d'inactivité** : la saisie appelle `queueSnapshot()`,
qui réarme un minuteur de 400 ms. L'instantané n'est validé que lorsque la frappe
s'arrête. Une phrase tapée d'un trait devient **une** entrée d'historique. Les
actions discrètes (changement de style, de police, de couleur, bascule
gras/italique) court-circuitent le délai et valident immédiatement : elles sont
atomiques du point de vue de l'utilisateur.

## Conséquences

- Ajouter un nouveau réglage à l'application ne demande aucun travail
  d'historique : il suffit qu'il figure dans l'instantané. C'est le bénéfice
  principal face au motif Commande.
- Le plafond de 50 entrées borne la mémoire ; au-delà, l'entrée la plus ancienne
  est écartée. Pour une session de création de bulles, la profondeur est large.
- `restoreSnapshot()` doit remettre l'interface **entière** en cohérence, pas
  seulement le canevas : classes actives, cases à cocher, et états ARIA des
  boutons à bascule. Un état ARIA oublié ici, c'est une interface qui ment aux
  lecteurs d'écran après une annulation — le piège de cette approche.
- Le regroupement à 400 ms est un compromis : trop court, l'historique se
  fragmente ; trop long, une annulation efface plus que prévu.

## Alternatives écartées

| Alternative | Pourquoi non |
|-------------|--------------|
| Motif Commande (chaque action porte son inverse) | Plus économe en mémoire, mais impose d'écrire et de maintenir une opération inverse par action ; coût permanent pour un gain invisible à cette échelle d'état. |
| Un instantané par événement `input` | Rend `Ctrl+Z` inutilisable sur du texte saisi. |
| Différentiel entre états successifs | Complexité d'un algorithme de diff pour un objet de huit champs. |

## Vérification

- `tests/undo-redo.spec.js` : `Ctrl+Z` / `Ctrl+Shift+Z` sur le sélecteur de style.
- Recette manuelle : taper une phrase d'un trait, `Ctrl+Z` → la phrase entière
  disparaît en une fois ; changer trois fois de style, `Ctrl+Z` trois fois → les
  trois changements se défont un par un.
