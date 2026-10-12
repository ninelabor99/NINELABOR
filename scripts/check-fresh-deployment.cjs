#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = name => fs.readFileSync(path.join(root, name), 'utf8');
const checks = [
  ['Git ignore protects .env', () => /^\.env\*/m.test(read('.gitignore'))],
  ['Git ignore protects dependencies', () => /^node_modules\//m.test(read('.gitignore'))],
  ['Git ignore protects build output', () => /^dist\//m.test(read('.gitignore'))],
  ['Frontend build command exists', () => JSON.parse(read('package.json')).scripts.build === 'vite build'],
  ['Express API server exists', () => /express\(/.test(read('server.ts'))],
  ['Firebase service account documented', () => read('.env.example').includes('FIREBASE_SERVICE_ACCOUNT_KEY')],
  ['RRN encryption key documented', () => read('.env.example').includes('RRN_ENCRYPTION_KEY')],
  ['Local env file is not bundled', () => !fs.existsSync(path.join(root,'.env'))],
  ['Private service account file is not bundled', () => !fs.existsSync(path.join(root,'serviceAccountKey.json'))],
];
let failures = 0;
for (const [label, check] of checks) {
  const ok = check();
  console.log(`${ok ? 'PASS' : 'FAIL'} ${label}`);
  if (!ok) failures++;
}
console.log(`${checks.length - failures}/${checks.length} checks passed (static only)`);
if (failures) process.exitCode = 1;
