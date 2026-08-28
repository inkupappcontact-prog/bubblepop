# 2026-08-28 — Mise en place de la traçabilité des modifications

- **Branche** : `claude/modification-history-tracking-ypjx14`
- **Point de départ** : `2821a56` (`fix(compliance)`, 2026-08-24)
- **Périmètre** : `CHANGELOG.md`, `docs/`, `tools/changelog.mjs`, `.github/workflows/lint.yml`, `CLAUDE.md`, `README.md`

## Objectif

Donner un support durable à l'historique du projet. Le point de départ était un
export Word d'une séance de travail — lisible, mais binaire, non comparable d'une
version à l'autre, invisible sur le dépôt, et mélangeant des informations de
natures différentes.

## Constat

Le dépôt comptait 43 commits au format Conventional Commits, avec des corps de
message qui portent réellement le *pourquoi* (`2821a56` explique le motif de
rejet Stripe et la distinction juridique don/pourboire). La matière était donc
saine ; il manquait les vues qui s'en déduisent.

Absents : aucun `CHANGELOG.md`, **aucun tag** (donc aucune borne de version,
aucune release GitHub), aucune trace des décisions d'architecture, aucun journal.

## Décisions

**Quatre supports plutôt qu'un document unique.** `git log` (ce qui a changé) →
`CHANGELOG.md` (ce que ça change pour l'utilisateur) → `docs/adr/` (pourquoi le
code est ainsi) → `docs/journal/` (comment s'est passé le chantier). Un
fourre-tout ne se consulte pas : c'est la séparation des questions qui rend
l'ensemble utile. Le `git log` fait foi, les trois autres s'en reconstituent.

**Le générateur n'écrit pas dans le CHANGELOG.** `tools/changelog.mjs` imprime un
brouillon groupé et trié, à relire. Reformuler un message de commit (écrit pour
un développeur) en ligne de changelog (écrite pour un utilisateur) est
précisément le travail qu'on ne peut pas automatiser ; un script qui écrirait
directement dans le fichier produirait un changelog que personne ne lit.

**Zéro dépendance pour l'outil**, comme `check-footer.mjs` : cohérent avec
[ADR-0001](../adr/0001-mono-fichier-zero-dependance.md), et un script sans
`node_modules` reste exécutable dans dix ans.

**Tags non antidatés.** Les six tags rétroactifs pointent vers les bons commits
mais portent leur date de création réelle (2026-08-28), mentionnée dans le
message du tag. Antidater les métadonnées pour faire croire à une pose au fil de
l'eau aurait été un mensonge gratuit dans un dépôt public.

**Le contexte non technique reste hors du dépôt.** L'export Word de la séance du
28/08 contient des éléments administratifs et un chemin de poste de travail :
ils n'entrent pas dans le journal. Règle inscrite dans `docs/journal/README.md`.

## Travaux

- `CHANGELOG.md` : six versions rétroactives reconstituées depuis les 43 commits,
  de `0.1.0` (2026-05-19) à `0.5.1` (2026-08-24), format Keep a Changelog + SemVer.
- `docs/adr/` : six ADR, chacun avec ses alternatives écartées, plus l'index et
  la procédure d'écriture.
- `docs/journal/` : la convention d'écriture, l'entrée de la séance du 28/08 sur
  l'utilisabilité, et celle-ci.
- `tools/changelog.mjs` : brouillon de section (sans argument), `--check` du
  format des messages, `--since <ref>` pour une plage arbitraire.
- CI : `changelog.mjs --check` ajouté au workflow `lint`, avec `fetch-depth: 0`
  sur le `checkout` — le clone superficiel par défaut ne contient qu'un commit,
  et le script aurait validé une plage vide en silence. Il détecte d'ailleurs ce
  cas explicitement plutôt que de laisser passer.
- `CLAUDE.md` : section « Historique des modifications » (procédure de release,
  quand écrire un ADR, quand écrire une entrée de journal). `README.md` : renvoi
  vers le CHANGELOG et les ADR.

## Vérifications

| Contrôle | Résultat |
|----------|----------|
| `node tools/changelog.mjs --check` | 44 messages au format attendu |
| `node tools/check-footer.mjs` | 7 pages, 6 liens identiques |
| `sitemap.xml` | Bien formé |
| Liens relatifs des `.md` | Tous résolus vers un fichier existant |
| Node local vs CI | v22 des deux côtés |

Le workflow `lint` ne se déclenche que sur `main` et sur les *pull requests*
vers `main` : la nouvelle étape n'a donc pas encore tourné sur un exécuteur
GitHub. Elle a été validée localement sur la même version de Node.

## État à la clôture

Trois actions restent à faire depuis un poste disposant des droits d'écriture
complets sur le dépôt.

**1. Pousser les tags.** Ils ont été créés puis refusés par GitHub (HTTP 403 :
le jeton de la séance n'écrit que sur sa branche, pas sur `refs/tags/*`). Tant
qu'ils n'existent pas, les liens de comparaison du `CHANGELOG.md` ne résolvent
pas, et `changelog.mjs` retombe sur les 50 derniers commits.

```bash
git tag -a v0.1.0 c1ef075 -m "v0.1.0 — 2026-05-19"   # première version publique
git tag -a v0.2.0 b983be9 -m "v0.2.0 — 2026-05-20"   # déploiement, perfs, 404
git tag -a v0.3.0 9d99cd7 -m "v0.3.0 — 2026-05-21"   # légal + financement
git tag -a v0.4.0 5d06dda -m "v0.4.0 — 2026-05-22"   # SEO éditorial + CI
git tag -a v0.5.0 3910f21 -m "v0.5.0 — 2026-06-08"   # tests E2E + blog
git tag -a v0.5.1 2821a56 -m "v0.5.1 — 2026-08-24"   # conformité Stripe
git push origin --tags
```

**2. Créer les releases GitHub** sur ces six tags, en collant la section
correspondante du `CHANGELOG.md`. C'est ce qui rend l'historique lisible sans
cloner le dépôt.

**3. Pousser la branche `chore/app-utilisable-dp`** (séance du 28/08 sur
l'utilisabilité), restée locale : ses trois commits ne sont sauvegardés nulle
part et n'apparaissent dans aucune de ces vues. Une fois fusionnée,
`node tools/changelog.mjs` produira le brouillon de la version suivante, et les
deux mécanismes qu'elle introduit (encodeur ZIP, rendu unique partagé) méritent
chacun leur ADR.
