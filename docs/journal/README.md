# Journal des séances de travail

Un fichier par séance : `AAAA-MM-JJ-slug.md`.

Le `CHANGELOG.md` dit *ce qui* a changé, les ADR disent *pourquoi* le code est
construit ainsi. Le journal, lui, garde la trace du **déroulé** : ce qu'un audit
a révélé, les arbitrages tranchés en cours de route, les défauts trouvés hors du
plan initial, ce qui a été vérifié et comment. C'est la mémoire qui ne rentre ni
dans un message de commit ni dans une décision d'architecture, et c'est celle
qu'on regrette le plus de ne pas avoir six mois plus tard.

## Contenu attendu

| Section | Contenu |
|---------|---------|
| **Objectif** | Ce qu'on cherchait à obtenir, en une ou deux phrases. |
| **Constat / audit** | L'état trouvé au départ, avec les faits vérifiables. |
| **Arbitrages** | Les choix tranchés en séance et leur motif. |
| **Travaux** | Ce qui a été fait, par lot. |
| **Vérifications** | Ce qui a été exécuté, et ce que ça a donné — chiffres inclus. |
| **Écarts hors plan** | Ce qu'on a trouvé sans le chercher. |
| **État à la clôture** | Branche, commits, ce qui reste ouvert. |

## Règles

- **Technique seulement.** Pas d'identifiants, pas de mots de passe, pas de
  chemins de poste de travail, pas de données personnelles, pas de documents
  administratifs. Le dépôt est public : ce qui relève du contexte privé reste
  hors du dépôt (`~/Documents/bubblepop-ops/`, ignoré par `.gitignore`).
- **Des faits, pas des impressions.** « 16 tests au vert, contraste mesuré à
  4,8:1 » vaut mieux que « tout fonctionne bien ».
- **Écrit le jour même**, ou reconstitué depuis les commits et les relevés de la
  séance tant qu'ils sont frais.
- Une séance sans effet notable ne mérite pas d'entrée : les commits suffisent.
