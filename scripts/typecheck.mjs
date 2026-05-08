#!/usr/bin/env node
/**
 * Human-readable wrapper around `tsc --noEmit`.
 * Streams progress, then prints a one-line summary suitable for a pre-commit
 * hook. Exits non-zero on the first type error, like `tsc`.
 */
import { spawnSync } from 'node:child_process';

const ICON = { ok: '✓', err: '✖', info: 'ℹ' };

process.stdout.write(`${ICON.info} typecheck: running tsc --noEmit ...\n`);

// Use shell:true so Windows resolves `npx` via PATHEXT (.cmd) consistently
// and we get an accurate exit status from the tsc process.
const result = spawnSync('npx --no -- tsc --noEmit --pretty', {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, FORCE_COLOR: '1' },
});

if (result.status === 0) {
    process.stdout.write(`${ICON.ok} typecheck: no TypeScript errors\n`);
    process.exit(0);
}

process.stderr.write(
    `\n${ICON.err} typecheck FAILED — fix the TypeScript errors above before committing.\n` +
        `  Tip: run \`npm run typecheck\` locally to iterate.\n\n`
);
process.exit(result.status || 1);
