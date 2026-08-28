# ADR-0005 — Filtrage par listes blanches de tout ce qui est relu du stockage local

- **Statut** : accepté
- **Date** : 2026-05-19
- **Portée** : `sanitizeSnapshot()`, lecture de `bp:lang`, `bp:theme`, historique

## Contexte

L'application persiste dans `localStorage` la langue, le thème et les 9 dernières
bulles. Au chargement, ces valeurs sont relues et appliquées à l'interface : une
police est injectée dans `ctx.font`, une couleur dans un style, un numéro de
bulle sert à choisir un fichier image.

`localStorage` **n'est pas une source de confiance**. Il est modifiable par la
console du navigateur, par une extension installée par l'utilisateur, ou par tout
script s'exécutant sur la même origine. Une valeur écrite par l'application à la
version *n* peut être relue par la version *n+2* après un changement de format.
Traiter ces données comme si l'application les avait produites, c'est faire
confiance à une entrée qu'on ne contrôle pas.

## Décision

Toute valeur relue du stockage local traverse un filtre par **liste blanche**
avant usage. On n'essaie pas de détecter ce qui est dangereux ; on n'accepte que
ce qui figure dans un ensemble de valeurs connues, et on retombe sur une valeur
par défaut sinon.

```js
const ALLOWED_FONTS   = ['Comic Relief', 'Bangers', 'Komika Axis',
                         'Architects Daughter', 'Permanent Marker'];
const ALLOWED_BUBBLES = [1, 2, 3, 4];
const HEX_COLOR_RE    = /^#[0-9A-Fa-f]{6}$/;
```

`sanitizeSnapshot()` applique ce principe champ par champ : type vérifié, valeur
contrainte à l'ensemble autorisé, chaînes tronquées à `MAX_TEXT_LEN`, nombres
bornés (`Math.max(20, Math.min(400, …))`), booléens forcés par double négation.
La fonction retourne toujours un instantané valide, ou `null` si l'entrée n'est
même pas un objet. Aucun appelant n'a donc à se défendre lui-même.

## Conséquences

- Une entrée corrompue dégrade l'expérience (retour aux valeurs par défaut) au
  lieu de casser l'application ou d'injecter une valeur arbitraire dans le rendu.
- Le format persisté peut évoluer sans migration explicite : les champs inconnus
  sont ignorés, les champs manquants prennent leur défaut.
- **Coût d'entretien réel** : ajouter une police ou un style de bulle oblige à
  mettre à jour la liste blanche correspondante, sans quoi la nouveauté est
  silencieusement remplacée par le défaut au rechargement. C'est le piège à
  connaître avant de toucher aux constantes de tête de fichier.
- Le filtrage est une défense en profondeur, pas la seule : le texte n'est jamais
  inséré via `innerHTML` (il est dessiné sur le canevas), et les en-têtes de
  sécurité sont posés dans `_headers`.

## Alternatives écartées

| Alternative | Pourquoi non |
|-------------|--------------|
| Faire confiance aux données écrites par l'application | Suppose que rien d'autre n'écrit dans le stockage, ce qui est faux par construction. |
| Liste noire des valeurs dangereuses | Il faut connaître à l'avance ce qu'on refuse ; toute valeur nouvelle passe. Une liste blanche échoue du bon côté. |
| Validation par schéma (bibliothèque tierce) | Interdit par [ADR-0001](0001-mono-fichier-zero-dependance.md), et disproportionné pour huit champs. |
| Chiffrer ou signer le contenu du stockage | La clé serait dans le code servi au navigateur : aucune garantie réelle. |

## Vérification

- Recette manuelle : écrire `localStorage.setItem('bp:history', '[{"font":"<script>"}]')`
  puis recharger → aucune erreur, retour aux valeurs par défaut.
- `tests/theme.spec.js` et `tests/i18n.spec.js` couvrent la relecture nominale
  (persistance du thème et de la langue après rechargement).
