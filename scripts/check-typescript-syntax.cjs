/** Parse JS/TS/TSX source files with esbuild; no network or Firebase access. */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const esbuild = require('esbuild');
const root = path.resolve(__dirname, '..');
const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'firebase-test-deps'].includes(entry.name)) continue;
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(file);
  }
}
walk(root);
let errors = 0;
for (const file of files) {
  const ext = path.extname(file);
  const loader = ext === '.tsx' ? 'tsx' : ext === '.ts' ? 'ts' : ext === '.jsx' ? 'jsx' : 'js';
  try {
    esbuild.transformSync(fs.readFileSync(file, 'utf8'), { loader, sourcefile: path.relative(root, file), logLevel: 'silent' });
  } catch (e) {
    errors++;
    console.error(path.relative(root, file) + ': ' + (e.errors || []).map(x => x.text + (x.location ? ' at ' + x.location.line + ':' + x.location.column : '')).join('; '));
  }
}
console.log('Parsed ' + files.length + ' JS/TS/TSX files; syntax errors: ' + errors + '. Parser: esbuild ' + require('esbuild/package.json').version);
process.exitCode = errors ? 1 : 0;
