#!/usr/bin/env node
'use strict';
// Run every existing offline test, then fail if any test failed.
const { spawnSync } = require('node:child_process');
const commands = ["npm run check:security:offline","npm run check:imports","npm run check:syntax","npm run check:offline-only","npm run check:security:phase22","npm run check:security:phase23","npm run check:plan-dates","npm run check:migration:phase24","npm run check:security:phase25","npm run check:security:phase26","npm run check:security:phase27","npm run check:security:phase28","npm run check:security:phase29","npm run check:http:phase30","npm run check:phase31","npm run check:phase32","npm run check:phase33","npm run check:phase34","npm run check:phase35","npm run check:phase36","npm run check:phase37","npm run check:phase38","npm run check:phase39-44","npm run check:phase45-49","npm run check:phase50-54","npm run check:phase55-60","npm run check:phase61-68","npm run check:phase69-76","npm run check:phase77-84","npm run check:phase85-92","npm run check:phase93-100","npm run check:phase101-108","npm run check:phase109-116","npm run check:phase133-140","npm run check:phase141-148","npm run check:phase149-156","npm run check:phase157-164","npm run check:phase117-124","npm run check:branch:phase17","npm run check:security:phase18","npm run check:security:phase19","node scripts/check-phase16-branch.cjs"];
const failures = [];
for (let i=0;i<commands.length;i++) {
  const command = commands[i];
  console.log('\n===== ['+(i+1)+'/'+commands.length+'] '+command+' =====');
  const result = spawnSync(command, {shell:true,stdio:'inherit',env:process.env});
  if (result.error || result.status !== 0) {
    failures.push(command);
    console.error('FAILED '+command+' (exit '+result.status+')');
  }
}
console.log('\nOffline checks: '+(commands.length-failures.length)+'/'+commands.length+' passed');
for (const command of failures) console.error('FAIL '+command);
process.exitCode=failures.length?1:0;
