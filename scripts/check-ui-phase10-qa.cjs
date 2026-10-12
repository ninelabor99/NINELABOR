const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root,p),'utf8');
const checks = [
 ['Google login prevents duplicate clicks', () => /if \(googlePendingRef\.current\) return/.test(read('src/components/dashboard/PortalShell.tsx'))],
 ['Google login pending always resets', () => /finally \{[\s\S]*?googlePendingRef\.current = false/.test(read('src/components/dashboard/PortalShell.tsx'))],
 ['Google button disabled while pending', () => read('src/components/dashboard/PortalShell.tsx').includes('disabled={googlePending}')],
 ['Google login error announced', () => read('src/components/dashboard/PortalShell.tsx').includes('role="alert"')],
 ['Workspace scope attached', () => read('src/components/dashboard/PortalShell.tsx').includes('nine-portal-content nine-workspace')],
 ['Worker tabs horizontally scroll', () => read('src/components/dashboard/WorkerView.tsx').includes('nine-workspace-tabs')],
 ['Company tabs horizontally scroll', () => read('src/components/dashboard/CompanyView.tsx').includes('nine-company-tabs')],
 ['Mobile font size avoids zoom', () => read('src/design-system.css').includes('font-size: 16px;')],
 ['Reduced motion supported', () => read('src/design-system.css').includes('prefers-reduced-motion: reduce')],
 ['Mobile safe area supported', () => read('src/design-system.css').includes('safe-area-inset-bottom')],
];
let failed = 0;
for(const [label,test] of checks){let pass=false;try{pass=!!test()}catch{};console.log(`${pass?'PASS':'FAIL'} ${label}`);if(!pass)failed++}
console.log(`${checks.length-failed}/${checks.length} checks passed (static only)`);
if(failed)process.exitCode=1;
