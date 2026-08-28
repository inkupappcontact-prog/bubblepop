# ADR-0001 — Application mono-fichier, zéro dépendance en production

- **Statut** : accepté
- **Date** : 2026-05-19
- **Portée** : `index.html` (HTML + CSS + JavaScript dans un seul fichier)

## Contexte

BubblePop est un outil gratuit, maintenu par une seule personne, destiné à
rester en ligne des années sans budget de maintenance. Un projet front-end
conventionnel (empaqueteur, gestionnaire de paquets, cadre applicatif) impose
une dette d'entretien indépendante du produit : chaque dépendance vieillit,
chaque montée de version du gestionnaire de paquets casse potentiellement la
compilation, et une application qu'on ne peut plus recompiler est une
application morte.

## Décision

Tout le HTML, le CSS et le JavaScript servis à l'utilisateur vivent dans
`index.html`. Aucun CDN, aucun paquet npm, aucune bibliothèque tierce à
l'exécution. Aucune étape de compilation : le fichier envoyé au navigateur est
le fichier qu'on édite.

Cette règle vise **l'exécution**. L'outillage de développement a le droit
d'avoir des dépendances : `package.json` porte Playwright pour les tests de bout
en bout, et `html-validate` est appelé à la demande en intégration continue.
Ces outils ne sont jamais servis à un visiteur.

## Conséquences

**Ce qu'on gagne**

- Le déploiement est une copie de fichiers : l'application est hébergeable
  partout (Cloudflare Pages aujourd'hui, n'importe quel serveur statique demain).
- Aucune faille de chaîne d'approvisionnement : il n'y a pas de chaîne.
- Une seule requête HTML pour un premier rendu complet, sans cascade de scripts.
- Le code reste lisible et défendable de bout en bout par son auteur.

**Ce qu'on paie**

- `index.html` dépasse les 3 000 lignes : la navigation s'appuie sur des
  bandeaux de section en commentaires plutôt que sur l'arborescence de fichiers.
- Pas de templating : le footer commun est **dupliqué** dans chaque page. C'est
  le coût le plus visible de cette décision, et il est compensé par un filet
  automatique — `tools/check-footer.mjs` compare les liens du footer de toutes
  les pages en intégration continue et fait échouer la CI en cas d'oubli.
- Les traductions vivent dans deux objets JavaScript en dur plutôt que dans des
  fichiers de langue.

## Alternatives écartées

| Alternative | Pourquoi non |
|-------------|--------------|
| Vite + framework (React, Svelte…) | Ajoute une étape de compilation et ~200 dépendances transitives pour une application dont l'état tient dans une dizaine de variables. |
| CSS/JS externalisés en fichiers séparés | Perd l'atout principal (un seul fichier à déployer et à relire) sans supprimer le vrai coût, qui est la duplication du footer entre *pages*. |
| Générateur de site statique pour le footer | Réintroduit l'étape de compilation, précisément ce que la décision élimine. |

## Vérification

- `npx html-validate@11 index.html …` en CI : régressions structurelles du HTML.
- `node tools/check-footer.mjs` en CI : cohérence du footer entre toutes les pages.
- Absence de `dependencies` (hors `devDependencies`) dans `package.json`.
