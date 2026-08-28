# ADR-0002 — Tout le traitement d'image dans le navigateur

- **Statut** : accepté
- **Date** : 2026-05-19
- **Portée** : `generateBubble()`, `doExport()`, historique local

## Contexte

Un générateur d'images peut se construire de deux façons : envoyer la saisie à
un serveur qui compose l'image et la renvoie, ou composer l'image sur le poste
de l'utilisateur. Le premier modèle impose un service à exploiter, à surveiller
et à financer, et fait transiter le contenu de l'utilisateur — un texte qui peut
être une réplique inédite de bande dessinée, une blague interne, un contenu
sous droits.

## Décision

L'intégralité du traitement se fait dans le navigateur, via l'API Canvas :
chargement de l'image de bulle, découpage du texte en lignes, calcul de la
taille de police, composition, puis export PNG à fond transparent par
`canvas.toDataURL('image/png')`. Aucun téléversement, aucun compte, aucun
serveur applicatif. L'historique des 9 dernières bulles est stocké dans
`localStorage`, donc sur l'appareil.

Conséquence assumée sur l'hébergement : le site est **entièrement statique**, ce
qui rend la promesse de confidentialité vérifiable — il n'y a pas de point de
collecte, et pas seulement une politique qui affirme qu'on ne collecte pas.

## Conséquences

**Ce qu'on gagne**

- La confidentialité est une propriété d'architecture, pas une promesse
  contractuelle : aucune image ne quitte l'appareil.
- Coût d'exploitation quasi nul, et charge indépendante du nombre d'utilisateurs.
- Aucune latence réseau entre une frappe au clavier et l'aperçu.

**Ce qu'on paie**

- Toute la logique — découpage du texte, ajustement de la taille, rendu — doit
  être écrite en JavaScript côté client (voir [ADR-0003](0003-ajustement-texte-dichotomie.md)),
  sous la contrainte du temps réel à chaque frappe.
- L'export dépend du navigateur : ouvrir `index.html` en `file://` produit un
  canevas « teinté » et bloque l'export ; il faut servir la page en HTTP (documenté
  dans le `README.md`).
- L'export doit rester **synchrone** dans le gestionnaire de clic pour conserver
  le geste utilisateur, sans quoi les navigateurs bloquent le téléchargement.
  Cette contrainte est documentée en commentaire au-dessus de `doExport()`.
- Pas de rendu côté serveur pour les réseaux sociaux : l'aperçu de partage est
  une image Open Graph statique, pas la bulle de l'utilisateur.

## Alternatives écartées

| Alternative | Pourquoi non |
|-------------|--------------|
| Rendu serveur (Node + canvas) | Impose un service à héberger et à sécuriser, et détruit l'argument de confidentialité qui est la raison d'être du produit. |
| Fonction *serverless* pour le seul export | Même problème à échelle réduite : le texte de l'utilisateur transiterait quand même. |
| Compte utilisateur pour l'historique | Ajoute des données personnelles, donc des obligations RGPD, pour un bénéfice nul face à `localStorage`. |

## Vérification

- `tests/export.spec.js` : l'export produit un PNG valide (signature vérifiée) de
  plus de 50 Kio.
- `tests/smoke.spec.js` : canevas 2000 × 2000 et aucune erreur de console.
- L'onglet réseau ne montre aucune requête sortante lors d'une génération.
