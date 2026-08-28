# ADR-0006 — Blog : une langue = une URL, contenu en dur

- **Statut** : accepté
- **Date** : 2026-06-08
- **Portée** : `blog/*.html`

## Contexte

Le site est bilingue FR/EN. Sur l'application et les pages utilitaires
(`privacy`, `legal`, `support`), la bascule se fait **à l'exécution** : le texte
des deux langues est présent dans la page et un script échange les libellés selon
`?lang=`, le stockage local ou la langue du navigateur. Une seule URL sert les
deux langues.

Ce modèle est confortable, mais il a été retenu pour des pages dont le
référencement n'est pas l'objectif. Le blog, lui, existe **uniquement** pour
capter la recherche longue traîne. Or un moteur indexe une URL et une langue :
une page qui change de langue après exécution du script présente un contenu
instable, sans `<html lang>` fiable, et dilue deux intentions de recherche
distinctes sur une seule adresse.

## Décision

Pour les articles de blog : **un article = une langue = une URL**, avec le
contenu écrit en dur dans le HTML servi, sans injection JavaScript.

- Les variantes d'un même sujet sont deux fichiers distincts, aux adresses
  porteuses de mots-clés dans leur langue (`how-to-add-a-speech-bubble-to-an-image`
  et `ajouter-une-bulle-de-bd-sur-une-image`), reliés par des `hreflang`
  réciproques et par un lien de bascule visible.
- `<html lang>` est figé. Le seul script d'un article gère le thème.
- Le hub `blog/index.html` reste l'exception : bilingue à l'exécution comme
  l'accueil, il ne vise aucun mot-clé propre et liste les articles avec un badge
  de langue.

## Conséquences

- Chaque article est indexable tel qu'il est servi, sans dépendre de l'exécution
  du JavaScript par le robot.
- Le site porte donc **deux modèles d'internationalisation** cohabitant : bascule
  à l'exécution pour l'interface, une URL par langue pour l'éditorial. C'est une
  incohérence apparente qu'il faut pouvoir justifier — d'où cet ADR.
- Publier dans les deux langues coûte deux fichiers, deux entrées de sitemap,
  deux redirections et deux cartes sur le hub. La procédure est écrite dans
  `CLAUDE.md` (« Checklist pour ajouter un article ») pour qu'aucune étape ne
  saute.
- Le lint HTML et le contrôle du footer couvrent automatiquement tout nouvel
  article via un motif générique : aucun workflow à modifier à chaque publication.

## Alternatives écartées

| Alternative | Pourquoi non |
|-------------|--------------|
| Bascule à l'exécution comme le reste du site | Une seule URL pour deux intentions de recherche, `<html lang>` non fiable, contenu dépendant du script : contraire au seul objectif de la page. |
| Préfixes de langue `/fr/` et `/en/` | Plus propre à grande échelle, mais impose de dupliquer *tout* le site, y compris l'application mono-fichier. Disproportionné pour quelques articles. |
| Traduction automatique côté client | Qualité rédactionnelle non maîtrisée sur des pages dont le contenu *est* le produit. |

## Vérification

- `npx html-validate@11 "blog/**/*.html"` en CI (dont la règle `long-title` :
  titre ≤ 70 caractères).
- `node tools/check-footer.mjs` : le footer des articles est aligné sur celui de
  l'accueil.
- `sitemap.xml` : chaque article a son URL et ses `xhtml:link hreflang` croisés.
