'use strict';
// Firestore rules-unit-testing: SDK operations are checked against Firestore Security Rules.
const { initializeTestEnvironment, assertSucceeds, assertFails } = require('@firebase/rules-unit-testing');
const { doc, setDoc, getDoc, updateDoc, deleteDoc } = require('firebase/firestore');
const fs = require('node:fs');
const path = require('node:path');
const PROJECT_ID = 'demo-no-project';
const rulesPath = process.env.FIRESTORE_RULES_FILE || path.join(__dirname, '..', 'security-review', 'firestore.rules.candidate');
let pass = 0, fail = 0;
async function test(label, promise, expected) {
  try {
    if (expected === 'allow') await assertSucceeds(promise);
    else await assertFails(promise);
    console.log('PASS', label); pass++;
  } catch (e) { console.error('FAIL', label, e.message); fail++; }
}
async function main() {
  if (!fs.existsSync(rulesPath)) throw Error('Rules file not found: ' + rulesPath);
  const env = await initializeTestEnvironment({ projectId: PROJECT_ID, firestore: { host: '127.0.0.1', port: 8085, rules: fs.readFileSync(rulesPath, 'utf8') } });
  try {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async ctx => {
      const db = ctx.firestore();
      const seed = async (collection, id, data) => setDoc(doc(db, collection, id), data);
      await seed('users', 'admin_u1', { role:'ADMIN', uid:'admin_u1', isActive:true });
      await seed('admins', 'admin_u1', { active:true, branchId:'branch_1' });
      await seed('users', 'comp_a_mgr', { role:'COMPANY', companyId:'company_A', uid:'comp_a_mgr' });
      await seed('users', 'comp_b_mgr', { role:'COMPANY', companyId:'company_B', uid:'comp_b_mgr' });
      await seed('users', 'worker_active', { role:'WORKER', membershipStatus:'ACTIVE', employeeId:'emp_active', companyId:'company_A', uid:'worker_active' });
      await seed('users', 'worker_pending', { role:'WORKER', membershipStatus:'PENDING', employeeId:'emp_pending', uid:'worker_pending' });
      await seed('companies', 'company_A', { companyId:'company_A', branchId:'branch_1' });
      await seed('companies', 'company_B', { companyId:'company_B', branchId:'branch_1' });
      await seed('maternity_cases', 'case_with_deduction', { companyId:'company_A', employeeId:'emp_active', createdById:'comp_a_mgr', status:'UNDER_REVIEW', employeeName:'original', deductionInfo:{deductionId:'deduct_101',source:'MONTHLY_FREE'} });
      await seed('maternity_cases', 'case_no_deduction', { companyId:'company_A', employeeId:'emp_active', createdById:'comp_a_mgr', status:'UNDER_REVIEW', employeeName:'original' });
      await seed('maternity_deductions', 'deduct_101', { companyId:'company_A', caseId:'case_with_deduction', action:'DEDUCTION' });
    });
    const db = uid => env.authenticatedContext(uid).firestore();
    const a = db('comp_a_mgr'), b = db('comp_b_mgr'), admin = db('admin_u1'), worker = db('worker_active'), pending = db('worker_pending');
    const ref = (database, coll, id) => doc(database, coll, id);
    const base = (who, employee='emp_active') => ({companyId:'company_A',employeeId:employee,createdById:who,status:'SUBMITTED'});
    await test('Company A normal create', setDoc(ref(a,'maternity_cases','qa_a_create'), base('comp_a_mgr')), 'allow');
    await test('Company B cannot create in A', setDoc(ref(b,'maternity_cases','qa_b_cross_create'), base('comp_b_mgr')), 'deny');
    await test('Active worker own create', setDoc(ref(worker,'maternity_cases','qa_worker_create'), base('worker_active')), 'allow');
    await test('Pending worker cannot create', setDoc(ref(pending,'maternity_cases','qa_pending_create'), base('worker_pending','emp_pending')), 'deny');
    await test('Active worker cannot impersonate employee', setDoc(ref(worker,'maternity_cases','qa_worker_other'), base('worker_active','other_employee')), 'deny');
    await test('Company A reads own case', getDoc(ref(a,'maternity_cases','case_with_deduction')), 'allow');
    await test('Company B cannot read A case', getDoc(ref(b,'maternity_cases','case_with_deduction')), 'deny');
    await test('Company A updates own business field', updateDoc(ref(a,'maternity_cases','case_with_deduction'), {employeeName:'changed'}), 'allow');
    await test('Company B cannot update A case', updateDoc(ref(b,'maternity_cases','case_with_deduction'), {employeeName:'intrusion'}), 'deny');
    await test('Worker cannot update case', updateDoc(ref(worker,'maternity_cases','case_with_deduction'), {employeeName:'intrusion'}), 'deny');
    await test('Company cannot change deductionInfo', updateDoc(ref(a,'maternity_cases','case_with_deduction'), {'deductionInfo.source':'PAID_PREPAID'}), 'deny');
    await test('Company cannot inject deductionInfo', updateDoc(ref(a,'maternity_cases','case_no_deduction'), {deductionInfo:{deductionId:'fake'}}), 'deny');
    await test('Admin cannot change deductionInfo via client', updateDoc(ref(admin,'maternity_cases','case_with_deduction'), {'deductionInfo.source':'PAID_PREPAID'}), 'deny');
    await test('Admin can update normal case field', updateDoc(ref(admin,'maternity_cases','case_with_deduction'), {status:'ASSIGNED'}), 'allow');
    await test('Company A reads own ledger', getDoc(ref(a,'maternity_deductions','deduct_101')), 'allow');
    await test('Company B cannot read A ledger', getDoc(ref(b,'maternity_deductions','deduct_101')), 'deny');
    await test('Worker cannot read ledger', getDoc(ref(worker,'maternity_deductions','deduct_101')), 'deny');
    await test('Company cannot create ledger', setDoc(ref(a,'maternity_deductions','qa_company_deduction'), {companyId:'company_A'}), 'deny');
    await test('Admin cannot create ledger via client', setDoc(ref(admin,'maternity_deductions','qa_admin_deduction'), {companyId:'company_A'}), 'deny');
    await test('Company cannot update ledger', updateDoc(ref(a,'maternity_deductions','deduct_101'), {action:'TAMPERED'}), 'deny');
    await test('Company cannot delete ledger', deleteDoc(ref(a,'maternity_deductions','deduct_101')), 'deny');
    await test('Company cannot delete case', deleteDoc(ref(a,'maternity_cases','case_no_deduction')), 'deny');
    await test('Worker cannot delete case', deleteDoc(ref(worker,'maternity_cases','case_no_deduction')), 'deny');
    await test('Admin can delete case', deleteDoc(ref(admin,'maternity_cases','case_no_deduction')), 'allow');
    // Regression coverage: all client writes to server-owned deduction state must fail.
    await test('Company cannot create case with deductionInfo', setDoc(ref(a,'maternity_cases','qa_company_inject'), {...base('comp_a_mgr'), deductionInfo:{source:'PAID_PREPAID'}}), 'deny');
    await test('Admin cannot create case with deductionInfo', setDoc(ref(admin,'maternity_cases','qa_admin_inject'), {...base('admin_u1'), deductionInfo:{source:'MONTHLY_FREE'}}), 'deny');
    await test('Company cannot remove deductionInfo', updateDoc(ref(a,'maternity_cases','case_with_deduction'), {deductionInfo:null}), 'deny');
    await test('Admin cannot remove deductionInfo', updateDoc(ref(admin,'maternity_cases','case_with_deduction'), {deductionInfo:null}), 'deny');
    await test('Admin cannot update ledger via client', updateDoc(ref(admin,'maternity_deductions','deduct_101'), {action:'TAMPERED'}), 'deny');
    await test('Admin cannot delete ledger via client', deleteDoc(ref(admin,'maternity_deductions','deduct_101')), 'deny');
    console.log(`TOTAL ${pass+fail} PASS ${pass} FAIL ${fail}`);
    if (fail) process.exitCode = 1;
  } finally { await env.cleanup(); }
}
main().catch(e => { console.error(e); process.exitCode = 1; });
