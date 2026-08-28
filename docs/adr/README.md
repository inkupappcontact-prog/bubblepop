# Décisions d'architecture (ADR)

Un **ADR** (*Architecture Decision Record*) consigne une décision structurante :
son contexte, ce qui a été décidé, ce que ça coûte, et ce qui a été écarté. Un
commit dit *ce qui* a changé ; un ADR dit *pourquoi*, et surtout pourquoi
**pas** autrement — c'est l'information qui se perd le plus vite.

Un ADR est **immuable** une fois accepté. Si la décision change, on n'édite pas
l'ancien : on écrit un nouvel ADR qui le remplace, et on passe l'ancien au
statut « remplacé par ADR-XXXX ». L'historique des décisions se lit ainsi comme
une suite de couches, y compris les décisions abandonnées.

## Index

| N° | Décision | Statut | Date |
|----|----------|--------|------|
| [0001](0001-mono-fichier-zero-dependance.md) | Application mono-fichier, zéro dépendance en production | Accepté | 2026-05-19 |
| [0002](0002-traitement-cote-client.md) | Tout le traitement d'image dans le navigateur | Accepté | 2026-05-19 |
| [0003](0003-ajustement-texte-dichotomie.md) | Ajustement de la taille du texte par recherche dichotomique | Accepté | 2026-05-19 |
| [0004](0004-historique-snapshots-debounce.md) | Annuler/refaire par instantanés regroupés par inactivité | Accepté | 2026-05-19 |
| [0005](0005-listes-blanches-localstorage.md) | Filtrage par listes blanches de tout ce qui est relu du stockage local | Accepté | 2026-05-19 |
| [0006](0006-blog-une-langue-une-url.md) | Blog : une langue = une URL, contenu en dur | Accepté | 2026-06-08 |
| [0007](0007-encodeur-zip-natif.md) | Encodeur ZIP écrit à la main | Accepté | 2026-08-28 |
| [0008](0008-rendu-partage-drawbubble.md) | Une seule fonction de rendu pour trois sorties | Accepté | 2026-08-28 |

## Écrire un nouvel ADR

1. Copier le plus récent comme modèle, numéroter à la suite (jamais de trou,
   jamais de réutilisation d'un numéro).
2. Nommer le fichier `NNNN-titre-en-minuscules-avec-tirets.md`.
3. Renseigner **Contexte / Décision / Conséquences / Alternatives écartées /
   Vérification**. La section « Alternatives écartées » n'est pas optionnelle :
   c'est elle qui distingue un ADR d'un paragraphe de documentation.
4. Ajouter la ligne dans l'index ci-dessus.
5. Référencer l'ADR dans le commit qui applique la décision (`Réf. ADR-0007`).

Un ADR n'est justifié que si la décision est **coûteuse à revenir** ou
**surprenante à la lecture du code**. Un choix évident n'a pas besoin d'ADR.
