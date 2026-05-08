#!/usr/bin/env node
/**
 * Pre-commit guard: when application source files are about to be committed,
 * require both:
 *   1. A version bump in package.json (compared to HEAD)
 *   2. A matching `## [X.Y.Z]` heading in CHANGELOG.md
 *
 * Skipped when:
 *   - No staged files match the SOURCE_GLOBS below
 *   - The only staged changes are docs / config / tests / changelog itself
 *   - Environment variable SKIP_VERSION_CHECK=1 is set
 *
 * Output is intentionally human-readable with a leading icon prefix so the
 * agent / developer can scan and fix issues fast.
 */
import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();

const ICON = {
    info: 'ℹ',
    ok: '✓',
    warn: '⚠',
    err: '✖',
};

function log(kind, msg) {
    const prefix = ICON[kind] || ICON.info;
    process.stdout.write(`${prefix} version-check: ${msg}\n`);
}

function fail(msg, hint) {
    process.stderr.write(`\n${ICON.err} version-check FAILED\n`);
    process.stderr.write(`  ${msg}\n`);
    if (hint) process.stderr.write(`  → ${hint}\n`);
    process.stderr.write(`\n  Bypass (not recommended): SKIP_VERSION_CHECK=1 git commit ...\n\n`);
    process.exit(1);
}

if (process.env.SKIP_VERSION_CHECK === '1') {
    log('warn', 'skipped via SKIP_VERSION_CHECK=1');
    process.exit(0);
}

// What counts as "application source" — bumping these requires a version + changelog change.
const SOURCE_PREFIXES = [
    'app/',
    'components/',
    'utils/',
    'hooks/',
    'services/',
    'config/',
    'i18n/',
    'messages/',
    'types/',
    'proxy.ts',
    'next.config.js',
    'tailwind.config.ts',
];

// Files that on their own should NOT trigger a bump.
const IGNORED_PREFIXES = [
    'docs/',
    '__tests__/',
    '__mocks__/',
    'coverage/',
    'screenshots/',
    'scripts/',
    '.husky/',
    '.github/',
    '.vscode/',
];

function staged() {
    try {
        const out = execSync('git diff --cached --name-only --diff-filter=ACMR', {
            encoding: 'utf8',
        });
        return out
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter(Boolean);
    } catch (err) {
        fail(`failed to read staged files: ${err.message}`);
    }
}

function isSource(file) {
    if (IGNORED_PREFIXES.some((p) => file.startsWith(p))) return false;
    return SOURCE_PREFIXES.some((p) => file === p || file.startsWith(p));
}

function getJSON(ref, path) {
    try {
        return JSON.parse(execSync(`git show ${ref}:${path}`, { encoding: 'utf8' }));
    } catch {
        return null;
    }
}

function getCurrentJSON(path) {
    return JSON.parse(readFileSync(resolve(ROOT, path), 'utf8'));
}

const stagedFiles = staged();
if (stagedFiles.length === 0) {
    log('info', 'no staged files; skipping');
    process.exit(0);
}

const sourceTouched = stagedFiles.filter(isSource);
if (sourceTouched.length === 0) {
    log('ok', 'no application source files staged; skipping bump check');
    process.exit(0);
}

log('info', `${sourceTouched.length} source file(s) staged — bump check enabled`);

const currentPkg = getCurrentJSON('package.json');
const headPkg = getJSON('HEAD', 'package.json');
const currentVersion = currentPkg?.version;
const headVersion = headPkg?.version;

if (!currentVersion) {
    fail('package.json has no `version` field.');
}

if (!headVersion) {
    log('info', 'no previous package.json (initial commit?), skipping');
    process.exit(0);
}

if (currentVersion === headVersion) {
    fail(
        `version unchanged: still ${currentVersion}.`,
        `Bump package.json "version" (e.g. ${bumpHint(currentVersion)}) and add a "## [${bumpHint(
            currentVersion
        )}] - ${today()}" entry to CHANGELOG.md.`
    );
}

log('ok', `version bumped: ${headVersion} → ${currentVersion}`);

// Verify CHANGELOG.md has a matching heading.
const changelogPath = resolve(ROOT, 'CHANGELOG.md');
if (!existsSync(changelogPath)) {
    fail(
        `CHANGELOG.md not found at repo root.`,
        `Create CHANGELOG.md and add a "## [${currentVersion}] - ${today()}" entry.`
    );
}
const changelog = readFileSync(changelogPath, 'utf8');
const headingRe = new RegExp(
    `^##\\s*\\[${currentVersion.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}\\]`,
    'm'
);
if (!headingRe.test(changelog)) {
    fail(
        `CHANGELOG.md is missing a "## [${currentVersion}]" entry.`,
        `Add a "## [${currentVersion}] - ${today()}" section describing the changes.`
    );
}

// Verify the changelog itself is staged when it was edited (catch the common
// mistake of editing CHANGELOG.md but forgetting to stage it).
const changelogStaged = stagedFiles.includes('CHANGELOG.md');
if (!changelogStaged) {
    log('warn', 'CHANGELOG.md has the new heading but is not staged; staging is recommended.');
}

log('ok', `CHANGELOG.md contains entry for ${currentVersion}`);
process.exit(0);

function bumpHint(v) {
    const [maj, min, patch] = v.split('.').map((n) => Number(n) || 0);
    return `${maj}.${min}.${patch + 1}`;
}
function today() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${m}-${day}`;
}
