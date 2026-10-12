#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const cp=require('node:child_process');
const root=path.resolve(__dirname,'..');
const config=JSON.parse(fs.readFileSync(path.join(root,'firebase-applet-config.json'),'utf8'));
const source=fs.readFileSync(path.join(root,'storage.rules'),'utf8');
const script=path.join(root,'scripts/check-firebase-config-consistency.cjs');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'nine-firebase-preflight-'));
const run=project=>cp.spawnSync(process.execPath,[script],{cwd:dir,env:{...process.env,FIREBASE_PROJECT_ID:project,GCLOUD_PROJECT:'',GOOGLE_CLOUD_PROJECT:''},encoding:'utf8'});
try {
  fs.writeFileSync(path.join(dir,'firebase-applet-config.json'),JSON.stringify(config));
  fs.writeFileSync(path.join(dir,'storage.rules'),source);
  assert.notEqual(run(config.projectId).status,0,'Mismatched database references must block release');
  console.log('PASS current Storage database mismatch blocks release');
  const refs=[...source.matchAll(new RegExp('/databases/([^/\\s]+)/documents/','g'))].map(m=>m[1]);
  assert.ok(refs.length>0,'Storage references must be present');
  let fixed=source;
  for(const id of new Set(refs)) fixed=fixed.split('/databases/'+id+'/documents/').join('/databases/'+config.firestoreDatabaseId+'/documents/');
  fs.writeFileSync(path.join(dir,'storage.rules'),fixed);
  assert.equal(run(config.projectId).status,0,'Matching Firebase configuration should pass');
  console.log('PASS matching project and database pass');
  assert.notEqual(run('wrong-project').status,0,'Wrong deployment project must block release');
  console.log('PASS wrong project blocks release');
  fs.writeFileSync(path.join(dir,'storage.rules'),source);
  assert.notEqual(run(config.projectId).status,0,'Restored mismatch must block release');
  console.log('PASS restored database mismatch blocks release');
} finally {fs.rmSync(dir,{recursive:true,force:true});}
