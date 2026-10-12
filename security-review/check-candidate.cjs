// Candidate-only structural regression checks; NOT a substitute for Firebase Emulator.
const fs=require('node:fs');
const assert=require('node:assert/strict');
const rules=fs.readFileSync('security-review/firestore.rules.candidate','utf8');
function block(name){
 const start=rules.indexOf('match /'+name+'/{');
 assert(start>=0,`Missing collection ${name}`);
 let depth=0, open=rules.indexOf('{',start + ('match /'+name+'/{').length);
 for(let i=open;i<rules.length;i++){
   if(rules[i]==='{')depth++;
   if(rules[i]==='}' && --depth===0)return rules.slice(open,i+1);
 }
 throw Error('Unclosed match '+name);
}
const checks=[
 ['Default deny',()=>assert.match(rules,/match \/\{document=\*\*\}\s*\{\s*allow read, write: if false;/)],
 ['Admin requires separate record',()=>assert.match(rules,/function isAdmin\(\)[\s\S]*?exists\(\/databases\/\$\(database\)\/documents\/admins\/\$\(request\.auth\.uid\)\)/)],
 ['Worker update cannot change company',()=>assert.match(block('workers'),/request\.resource\.data\.get\('companyId', ''\) == resource\.data\.get\('companyId', ''\)/)],
 ['Worker update cannot change userId',()=>assert.match(block('workers'),/request\.resource\.data\.get\('userId', null\) == resource\.data\.get\('userId', null\)/)],
 ['Worker update cannot change employeeId',()=>assert.match(block('workers'),/request\.resource\.data\.get\('employeeId', null\) == resource\.data\.get\('employeeId', null\)/)],
 ['Maternity worker creation company binding',()=>assert.match(block('maternity_cases'),/request\.resource\.data\.get\('companyId', ''\) == getUserData\(\)\.get\('companyId', ''\)/)],
 ['Maternity worker creation employee binding',()=>assert.match(block('maternity_cases'),/request\.resource\.data\.get\('employeeId', ''\) == getUserData\(\)\.get\('employeeId', ''\)/)],
 ['Maternity update immutable creator',()=>assert.match(block('maternity_cases'),/request\.resource\.data\.get\('createdById', null\) == resource\.data\.get\('createdById', null\)/)],
 ['Deduction client writes denied',()=>assert.match(block('maternity_deductions'),/allow create, update, delete:\s*if false\s*;/)],
 ['Deduction client update and delete denied',()=>{const b=block('maternity_deductions'); assert.match(b,/allow create, update, delete:\s*if false\s*;/); assert.doesNotMatch(b,/allow\s+(?:write|create|update|delete)\s*:\s*if\s+(?!false\s*;)/)}]
];
let failed=0;
for(const [name,run] of checks){try{run();console.log('PASS '+name)}catch(e){failed++;console.error('FAIL '+name+': '+e.message)}}
console.log(`${checks.length-failed}/${checks.length} candidate structural checks passed`);
if(failed)process.exitCode=1;
