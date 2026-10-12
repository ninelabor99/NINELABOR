#!/usr/bin/env node
// Checks the extracted source tree before publishing it to a new GitHub repository.
// This is a filename/configuration audit, not a secret scanner or deployment verification.
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const fail = [];
const warn = [];
const exists = p => fs.existsSync(path.join(root, p));
const ignored = fs.readFileSync(path.join(root, '.gitignore'), 'utf8');
const packageJson = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
for (const name of ['.env', '.env.local', '.env.production', 'serviceAccountKey.json', 'firebase-service-account.json']) {
  if (exists(name)) fail.push(`Sensitive local configuration present: ${name}`);
}
for (const name of ['node_modules', 'dist', '.git']) {
  if (exists(name)) fail.push(`Generated/local directory present: ${name}`);
}
for (const rule of ['.env*', 'node_modules/', 'dist/', '*.pem', '*.key', '*service-account*.json']) {
  if (!ignored.split(/\r?\n/).includes(rule)) fail.push(`Missing .gitignore rule: ${rule}`);
}
if (!ignored.includes('!.env.example')) fail.push('Missing public environment template exception');
if (!exists('.env.example')) fail.push('Missing .env.example');
if (!exists('server.ts')) fail.push('Missing Express API server');
if (!packageJson.scripts?.build || !packageJson.scripts?.lint) fail.push('Missing build/lint commands');
if (!exists('package-lock.json') && !exists('bun.lock')) fail.push('Missing dependency lockfile');
if (!exists('node_modules')) warn.push('Dependencies not installed: full build not verified');
warn.push('Frontend /api requests require a deployed Express backend and routing; Netlify static deploy alone is insufficient');
warn.push('Firebase credentials, rules and real role/tenant tests must be configured and verified separately');
for (const m of fail) console.log('FAIL ' + m);
for (const m of warn) console.log('NOTE ' + m);
console.log(fail.length ? `Source export safety: FAILED (${fail.length})` : 'Source export safety: PASSED (limited static checks)');
if (fail.length) process.exitCode = 1;
