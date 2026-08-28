#!/usr/bin/env node
// Rédige la section « Non publié » du CHANGELOG à partir des messages de commit,
// et vérifie leur format en intégration continue.
//
// Le CHANGELOG reste écrit à la main : ce script produit un brouillon groupé et
// trié, pas le texte final. Un message de commit s'adresse à un développeur,
// une ligne de CHANGELOG à un utilisateur — la reformulation est le travail
// qu'on ne peut pas automatiser, et c'est pour ça que la sortie se relit avant
// d'être collée.
//
// Zéro dépendance (cf. ADR-0001) : uniquement node:child_process.
//
// Usage :
//   node tools/changelog.mjs                  brouillon depuis le dernier tag
//   node tools/changelog.mjs --since v0.4.0   brouillon depuis une référence
//   node tools/changelog.mjs --check          vérifie le format des messages (CI)

import { execFileSync } from 'node:child_process';

// Conventional Commits : https://www.conventionalcommits.org/fr/
// Le `!` optionnel signale une rupture de compatibilité.
const SUBJECT_RE = /^(?<type>[a-z]+)(?:\((?<scope>[^)]+)\))?(?<breaking>!)?: (?<desc>.+)$/;

const TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];

// Rubriques Keep a Changelog, dans l'ordre d'affichage. « Interne » n'en fait
// pas partie : c'est un ajout local pour ce qui n'a aucun effet visible pour
// l'utilisateur (outillage, CI, documentation). À arbitrer à la relecture —
// souvent, ces lignes se suppriment purement et simplement.
const SECTIONS = [
  ['Ajouté', ['feat']],
  ['Modifié', ['perf', 'refactor', 'style']],
  ['Corrigé', ['fix']],
  ['Retiré', ['revert']],
  ['Interne', ['docs', 'chore', 'ci', 'test', 'build']],
];

// Une portée `security` bascule le commit en rubrique « Sécurité », quel que
// soit son type : `fix(security)` et `chore(security)` méritent la même
// visibilité.
const SECURITY_SCOPES = new Set(['security', 'securite', 'sécurité']);

// Garde-fou quand le dépôt n'a encore aucun tag : sans borne, `--check`
// remonterait tout l'historique et resterait rouge à cause d'un vieux commit
// qu'on ne réécrira jamais.
const MAX_UNTAGGED = 50;

function git(...args) {
  return execFileSync('git', args, { encoding: 'utf8' }).trim();
}

/** Variante tolérante : renvoie null au lieu de lever, sans bruit sur stderr
 *  (`git describe` sur un dépôt sans tag écrit une erreur qui n'en est pas une). */
function tryGit(...args) {
  try {
    return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return null;
  }
}

/** Récupère les commits de la plage, hors fusions (leur message n'apporte rien). */
function readCommits(range) {
  const args = ['log', '--no-merges', '--format=%h%x1f%s%x1f%b%x1e'];
  if (range) args.push(range);
  else args.push(`-${MAX_UNTAGGED}`);

  return git(...args)
    .split('\x1e')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [hash, subject, body = ''] = entry.split('\x1f');
      const m = SUBJECT_RE.exec(subject);
      return {
        hash,
        subject,
        body,
        conforme: !!m && TYPES.includes(m.groups.type),
        type: m?.groups.type ?? null,
        scope: m?.groups.scope ?? null,
        desc: m?.groups.desc ?? subject,
        // Deux notations valides pour une rupture : le `!` du sujet, ou le
        // pied de message `BREAKING CHANGE:`.
        breaking: !!m?.groups.breaking || /^BREAKING[ -]CHANGE:/m.test(body)
      };
    });
}

const args = process.argv.slice(2);
const check = args.includes('--check');
const sinceIdx = args.indexOf('--since');
const since = sinceIdx !== -1 ? args[sinceIdx + 1] : null;

// Un clone superficiel (`fetch-depth: 1`) ne contient pas l'historique : mieux
// vaut le dire que valider une plage vide en silence.
if (tryGit('rev-parse', '--is-shallow-repository') === 'true') {
  console.error('⚠ Dépôt superficiel (shallow) : historique incomplet.');
  console.error('  En CI, utiliser actions/checkout avec `fetch-depth: 0`.');
  process.exit(check ? 0 : 1);
}

const lastTag = since ?? tryGit('describe', '--tags', '--abbrev=0');
const range = lastTag ? `${lastTag}..HEAD` : null;
const commits = readCommits(range);
const depuis = lastTag ? `depuis ${lastTag}` : `${MAX_UNTAGGED} derniers commits (aucun tag)`;

// ── Mode vérification (CI) ───────────────────────────────────────────────────
if (check) {
  const fautifs = commits.filter((c) => !c.conforme);
  if (fautifs.length) {
    console.error(`✖ ${fautifs.length} message(s) de commit hors format, ${depuis} :\n`);
    for (const c of fautifs) console.error(`    ${c.hash}  ${c.subject}`);
    console.error('\nFormat attendu : type(portée): description');
    console.error(`Types acceptés : ${TYPES.join(', ')}`);
    console.error('Exemple        : feat(export): archive ZIP de l\'historique');
    process.exit(1);
  }
  console.log(`✓ ${commits.length} message(s) de commit au format attendu (${depuis}).`);
  process.exit(0);
}

// ── Mode brouillon ───────────────────────────────────────────────────────────
if (!commits.length) {
  console.log(`Aucun commit ${depuis}.`);
  process.exit(0);
}

const buckets = new Map();
const push = (section, ligne) => {
  if (!buckets.has(section)) buckets.set(section, []);
  buckets.get(section).push(ligne);
};

for (const c of commits) {
  const section = SECURITY_SCOPES.has((c.scope ?? '').toLowerCase())
    ? 'Sécurité'
    : (SECTIONS.find(([, types]) => types.includes(c.type))?.[0] ?? 'À classer');
  const rupture = c.breaking ? '**RUPTURE** — ' : '';
  const portee = c.scope && !SECURITY_SCOPES.has(c.scope.toLowerCase()) ? `**${c.scope}** : ` : '';
  push(section, `- ${rupture}${portee}${c.desc}  <!-- ${c.hash} -->`);
}

const ordre = ['Ajouté', 'Modifié', 'Corrigé', 'Retiré', 'Sécurité', 'Interne', 'À classer'];

console.log(`## [Non publié]\n`);
for (const section of ordre) {
  const lignes = buckets.get(section);
  if (!lignes) continue;
  console.log(`### ${section}\n`);
  for (const l of lignes) console.log(l);
  console.log('');
}
console.error(`— ${commits.length} commit(s) ${depuis}. À relire et reformuler avant de coller dans CHANGELOG.md.`);
