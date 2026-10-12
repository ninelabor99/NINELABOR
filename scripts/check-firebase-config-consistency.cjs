#!/usr/bin/env node
'use strict';
// Read-only preflight: never print credential values.
const fs=require('node:fs');
const config=JSON.parse(fs.readFileSync('firebase-applet-config.json','utf8'));
const rules=fs.readFileSync('storage.rules','utf8');
const expected=process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || '';
const db=config.firestoreDatabaseId || '(default)';
const refs=[...rules.matchAll(new RegExp('/databases/([^/\\s]+)/documents/','g'))].map(m=>m[1]);
const checks=[
 ['Firebase project configured',Boolean(config.projectId)],
 ['Storage bucket configured',Boolean(config.storageBucket)],
 ['Deployment project matches application',Boolean(expected)&&expected===config.projectId],
 ['Storage rule database matches application',refs.length>0 && refs.every(id=>id===db)],
];
let fail=0;
for(const [label,ok] of checks){console.log((ok?'PASS ':'BLOCKED ')+label);if(!ok)fail++;}
if(fail)process.exitCode=1;
