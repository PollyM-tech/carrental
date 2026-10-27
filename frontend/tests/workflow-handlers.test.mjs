// Exercises the real Convex handlers against a minimal in-memory DB adapter.
// This checks application rules/authorization; it does not emulate Convex transactions.
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readdirSync, readFileSync, writeFileSync, mkdirSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ts from 'typescript';
const root = fileURLToPath(new URL('../', import.meta.url));
const compiled = mkdtempSync(join(tmpdir(), 'movara-handler-tests-'));
writeFileSync(join(compiled,"package.json"), JSON.stringify({type:"module"}));
symlinkSync(join(root,'node_modules'), join(compiled,'node_modules'), 'dir');
function compile(dir, rel='') {
 for (const entry of readdirSync(dir,{withFileTypes:true})) {
  const path=join(dir,entry.name), relative=join(rel,entry.name);
  if(entry.isDirectory()) { compile(path,relative); continue; }
  if(entry.name.endsWith('.d.ts') || !/\.(ts|js)$/.test(entry.name)) continue;
  const target=join(compiled,relative.replace(/\.ts$/,'.js'));mkdirSync(dirname(target),{recursive:true});
  writeFileSync(target,ts.transpileModule(readFileSync(path,'utf8'),{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText.replace(/(from ["'])(\.{1,2}\/[^"']+)(["'])/g, (_match, prefix, path, suffix) => prefix + path.replace(/\.ts$/, ".js") + (/\.[a-z]+$/i.test(path) ? "" : ".js") + suffix));
 }
}
compile(join(root,'convex'));
const bookings=await import(pathToFileURL(join(compiled,'bookingRequests.js')));
const care=await import(pathToFileURL(join(compiled,'customerCare.js')));
const vehicles=await import(pathToFileURL(join(compiled,'vehicles.js')));
const security=await import(pathToFileURL(join(compiled,'security.js')));
const sessionGuard=await import(pathToFileURL(join(compiled,'lib/session_guard.js')));
let id=0;
const rows=new Map();
const db={
 async get(key){return structuredClone(rows.get(key)??null)},
 async insert(table,doc){const key=`${table}:${++id}`;rows.set(key,{...structuredClone(doc),_id:key,_creationTime:Date.now()});return key},
 async patch(key,patch){const row=rows.get(key);if(!row)throw Error('Missing record');for(const [k,v] of Object.entries(patch)){if(v===undefined)delete row[k];else row[k]=structuredClone(v)}},
 async delete(key){rows.delete(key)},
 query(table){
  const constraints=[];let descending=false;
  const builder={withIndex(_index,fn){if(fn){const q={eq(field,value){constraints.push(row=>row[field]===value);return q}};fn(q)}return builder},order(order){descending=order==='desc';return builder},
   async collect(){const found=[...rows.values()].filter(r=>r._id.startsWith(table+':')&&constraints.every(fn=>fn(r))).sort((a,b)=>a._creationTime-b._creationTime);return structuredClone(descending?found.reverse():found)},
   async unique(){const found=await builder.collect();if(found.length>1)throw Error('Duplicate');return found[0]??null},async first(){return (await builder.collect())[0]??null},async take(n){return (await builder.collect()).slice(0,n)}};
  return builder;
 }
};
const sessionIds = new Map();
const context=user=>({db,auth:{getUserIdentity:async()=>user?{subject:user+'|'+sessionIds.get(user)}:null},storage:{getUrl:async()=>null}});
const run=(module,fn,user,args={})=>module[fn]._handler(context(user),args);
const today=new Date(Date.now()+10800000).toISOString().slice(0,10);
const date=days=>new Date(Date.parse(today+'T00:00:00Z')+days*86400000).toISOString().slice(0,10);
test('full in-person booking, approval and return flow enforces ownership and standing',async()=>{
 try {
 const owner=await db.insert('users',{email:'movaracarhire@gmail.com'}), customer=await db.insert('users',{email:'one@example.invalid'}), other=await db.insert('users',{email:'two@example.invalid'});
 for (const who of [owner, customer, other]) {
 await db.insert('authAccounts', { userId: who, provider: 'password', secret: 'test-hash', providerAccountId: who });
 await db.insert('movaraCredentialGuards', { userId: who, secretHash: 'test-hash', changedAt: Date.now()-1000 });
 sessionIds.set(who, await db.insert('authSessions', { userId: who, expirationTime: Date.now()+86400000 }));
 }
 await db.insert('staffMemberships',{userId:owner,roles:['owner'],active:true});
 await db.insert('staffMemberships',{userId:other,roles:['owner'],active:true});
 const car=await db.insert('movaraVehicles',{name:'Test',category:'SUV',registration:'TEST123',archived:false,published:true,status:'available',insuranceExpiresOn:date(365),inspectionExpiresOn:date(365),pricePerDay:3500,seats:5,transmission:'Automatic',fuel:'Petrol',brand:'Test',model:'Test',location:'Nairobi',description:'',isFeatured:false});
 const request=(who,start=10)=>run(bookings,'create',who,{vehicleId:car,requestKey:crypto.randomUUID(),pickupDate:date(start),returnDate:date(start+3),pickupLocation:'Nairobi',phone:'+447700900123'});
 const first=await request(customer), overlap=await request(other), later=await request(other,20);
 const contacts={fullName:'Test Customer',nextOfKinName:'Test Kin',nextOfKinPhone:'+12025550123',guarantorName:'Test Guarantor',guarantorPhone:'+447700900123',consentToContacts:true};
 await assert.rejects(run(care,'submit',other,{bookingId:first,...contacts}),/cannot be changed/);
 await assert.rejects(run(care,'adminDetail',other,{bookingId:first}),/permission/);
 await assert.rejects(run(bookings,'approve',customer,{id:first}),/permission/);
 await assert.rejects(run(bookings,'approve',owner,{id:first}),/in-person/);
 for(const [bookingId,who] of [[first,customer],[overlap,other],[later,other]])await run(care,'submit',who,{bookingId,...contacts});
 const approval=async bookingId=>{const current=await run(care,'adminDetail',owner,{bookingId});return {bookingId,verificationRevision:current.verification.revision,decision:'approved',phoneChecked:true,identityChecked:true,licenceChecked:true,ageChecked:true,licenceTenureChecked:true,contactsChecked:true,customerMessage:'Originals checked in person'}};
 const stale=await approval(first);
 await assert.rejects(run(care,'review',owner,{...stale,ageChecked:false}),/original identity/);
 await run(care,'review',owner,{...stale,customerMessage:''});
 assert.ok((await run(care,'adminDetail',owner,{bookingId:first})).verification.customerMessage);
 await run(care,'submit',customer,{bookingId:first,...contacts,fullName:'Updated Name'});
 await assert.rejects(run(care,'review',owner,stale),/details changed/);
 await assert.rejects(run(bookings,'approve',owner,{id:first}),/in-person/);
 await run(care,'review',owner,await approval(first));
 await run(bookings,'approve',owner,{id:first});
 const firstVersion=(await db.get(first)).approvalVersion;
 await run(bookings,'approve',owner,{id:first});
 assert.equal((await db.get(first)).approvalVersion,firstVersion);
 await assert.rejects(run(bookings,'cancelApproval',customer,{id:first,approvalVersion:firstVersion,notHandedOverConfirmed:true}),/permission/);
 await assert.rejects(run(bookings,'cancelApproval',owner,{id:first,approvalVersion:firstVersion,notHandedOverConfirmed:false}),/not been handed over/);
 assert.equal((await db.get(first)).status,'approved');
 await assert.rejects(run(bookings,'review',owner,{id:first,status:'in_review'}),/Cancel approval/);
 await run(bookings,'cancelApproval',owner,{id:first,approvalVersion:firstVersion,notHandedOverConfirmed:true});
 assert.equal((await db.get(first)).status,'in_review');
 assert.equal((await run(care,'adminDetail',owner,{bookingId:first})).verification.status,'approved');
 assert.equal((await run(vehicles,'publicList',null,{pickupDate:date(10),returnDate:date(13)})).length,1);
 await run(bookings,'cancelApproval',owner,{id:first,approvalVersion:firstVersion,notHandedOverConfirmed:true});
 await run(bookings,'approve',owner,{id:first});
 const secondVersion=(await db.get(first)).approvalVersion;
 assert.equal(secondVersion,firstVersion+1);
 await assert.rejects(run(bookings,'cancelApproval',owner,{id:first,approvalVersion:firstVersion,notHandedOverConfirmed:true}),/approval has changed/);
 assert.equal((await db.get(first)).status,'approved');
 await assert.rejects(run(bookings,'cancel',customer,{id:first}),/Contact Movara/);
 await assert.rejects(run(care,'submit',customer,{bookingId:first,...contacts}),/cannot be changed/);
 const combined = async bookingId => {
  const snapshot = await run(care,'adminDetail',owner,{bookingId});
  return {revision:snapshot.verification.revision,updatedAt:snapshot.verification.updatedAt,phoneChecked:true,identityChecked:true,licenceChecked:true,ageChecked:true,licenceTenureChecked:true,contactsChecked:true,customerMessage:''};
 };
 await assert.rejects(run(bookings,'approve',owner,{id:overlap,verification:await combined(overlap)}),/no longer available/);
 assert.equal((await run(care,'adminDetail',owner,{bookingId:overlap})).verification.status,'awaiting_in_person');
 assert.equal((await run(vehicles,'publicList',null,{pickupDate:date(10),returnDate:date(13)})).length,0);
 const staleCombined = await combined(later);
 await run(care,'submit',other,{bookingId:later,...contacts,fullName:'Updated second customer'});
 await assert.rejects(run(bookings,'approve',owner,{id:later,verification:staleCombined}),/details changed/);
 const completedChecks = await combined(later);
 await assert.rejects(run(bookings,'approve',owner,{id:later,verification:{...completedChecks,identityChecked:false}}),/original identity/);
 await run(care,'setStanding',owner,{customerId:other,status:'flagged',reason:'Prior non-compliance'});
 await assert.rejects(run(bookings,'approve',owner,{id:later,verification:completedChecks}),/flagged/);
 assert.equal((await run(care,'adminDetail',owner,{bookingId:later})).verification.status,'awaiting_in_person');
 await run(care,'setStanding',owner,{customerId:other,status:'second_chance',reason:'Explicit review'});
 await run(bookings,'approve',owner,{id:later,verification:completedChecks});
 const approvedTogether = await run(care,'adminDetail',owner,{bookingId:later});
 assert.equal(approvedTogether.booking.status,'approved');
 assert.equal(approvedTogether.verification.status,'approved');
 assert.equal(approvedTogether.verification.identityChecked,true);
 assert.ok(approvedTogether.verification.customerMessage);
 // Signed paper-contract clearance also works when no online verification profile exists.
 const paper=await request(customer,40), paperOverlap=await request(other,40);
 assert.equal((await run(care,'adminDetail',owner,{bookingId:paper})).verification,null);
 await assert.rejects(run(bookings,'approve',customer,{id:paper,manualClearance:{contractSigned:true,requirementsMet:true}}),/permission/);
 await assert.rejects(run(bookings,'approve',owner,{id:paper,manualClearance:{contractSigned:true,requirementsMet:false}}),/paper contract/);
 await run(care,'setStanding',owner,{customerId:customer,status:'flagged',reason:'Manual clearance eligibility test'});
 await assert.rejects(run(bookings,'approve',owner,{id:paper,manualClearance:{contractSigned:true,requirementsMet:true}}),/flagged/);
 await run(care,'setStanding',owner,{customerId:customer,status:'second_chance',reason:'Explicit second-chance review'});
 await run(bookings,'approve',owner,{id:paper,manualClearance:{contractSigned:true,requirementsMet:true}});
 assert.equal((await db.get(paper)).status,'approved');
 assert.equal((await db.get(paper)).manualClearance.contractSigned,true);
 assert.equal((await run(care,'adminDetail',owner,{bookingId:paper})).verification,null);
 assert.equal((await run(care,'mine',customer,{bookingId:paper})).manualClearanceRecorded,true);
 await assert.rejects(run(bookings,'approve',owner,{id:paperOverlap,manualClearance:{contractSigned:true,requirementsMet:true}}),/no longer available/);
 await run(bookings,'cancelApproval',owner,{id:paper,approvalVersion:1,notHandedOverConfirmed:true});
 assert.equal((await db.get(paper)).status,'in_review');
 assert.equal((await db.get(paper)).manualClearance,undefined);
 assert.equal(await run(care,'mine',customer,{bookingId:paper}),null);
 const outcome={bookingId:first,condition:'not_returned',rulesFollowed:false,disposition:'clear',notes:'Not returned under manual contract',handedOverConfirmed:true};
 await assert.rejects(run(care,'recordReturn',owner,outcome),/second chance/);
 await run(care,'recordReturn',owner,{...outcome,disposition:'flagged'});
 await assert.rejects(run(bookings,'cancelApproval',owner,{id:first,approvalVersion:secondVersion,notHandedOverConfirmed:true}),/Only an approved booking/);
 await assert.rejects(request(customer,30),/not yet been returned/);
 await run(care,'recordReturn',owner,{...outcome,condition:'good',rulesFollowed:true,notes:'Vehicle recovered'});
 const history=await run(care,'adminDetail',owner,{bookingId:first});
 assert.equal(history.booking.status,'returned');assert.equal(history.standing.status,'flagged');assert.equal(history.history.length,2);
 await assert.rejects(run(care,'mine',other,{bookingId:first}),/not found/);
 const own=await run(care,'mine',customer,{bookingId:first});assert.equal(own.fullName,'Updated Name');assert.equal('reviewedBy' in own,false);
 await run(care,'setStanding',owner,{customerId:customer,status:'second_chance',reason:'Car recovered, new review allowed'});
 await request(customer,30);
 await run(care,'recordReturn',owner,{bookingId:later,condition:'damage',rulesFollowed:false,disposition:'flagged',notes:'Damage recorded under contract',handedOverConfirmed:true});
 assert.equal((await db.get(later)).status,'returned');
 // Actual session handlers reject expired activity and never revive it on a heartbeat.
 assert.ok(await run(security,'status',customer));
 const activity=await db.insert('movaraSessionActivity',{sessionId:sessionIds.get(customer),lastActiveAt:Date.now()-31*60000});
 assert.equal(await run(security,'status',customer),null);
 assert.equal(await run(security,'touch',customer),null);
 await assert.rejects(run(bookings,'mine',customer),/Sign in/);
 await db.patch(activity,{lastActiveAt:Date.now()});
 const account=await db.query('authAccounts').withIndex('userIdAndProvider',q=>q.eq('userId',customer)).unique();
 await db.patch(account._id,{secret:'changed-hash'});
 assert.equal(await run(security,'status',customer),null);
 await sessionGuard.prepareCredentialGuard(context(customer),customer);
 assert.equal(await db.get(sessionIds.get(customer)),null);
 sessionIds.set(customer,await db.insert('authSessions',{userId:customer,expirationTime:Date.now()+86400000}));
 assert.ok(await run(security,'status',customer));
 // The CLI-only password reset changes credentials and revokes sessions atomically.
 const ownerAccount=await db.query('authAccounts').withIndex('userIdAndProvider',q=>q.eq('userId',owner)).unique();
 await db.patch(ownerAccount._id,{providerAccountId:'movaracarhire@gmail.com'});
 await db.insert('authRefreshTokens',{sessionId:sessionIds.get(owner),expirationTime:Date.now()+86400000});
 await run(security,'resetOwnerPassword',null,{hashedSecret:'new-salted-test-hash-'.repeat(3)});
 assert.equal(await db.get(sessionIds.get(owner)),null);
 assert.equal((await db.query('authRefreshTokens').collect()).length,0);
 await assert.rejects(run(bookings,'mine',owner),/Sign in/);
 for(let n=0;n<5;n++){
  assert.equal((await run(security,'beginAttempt',null,{key:'hashed-email',attemptId:String(n)})).allowed,true);
  const result=await run(security,'finishAttempt',null,{key:'hashed-email',attemptId:String(n),success:false});
  assert.equal(result.locked,n===4);
 }
 const locked=await run(security,'beginAttempt',null,{key:'hashed-email',attemptId:'sixth'});
 assert.equal(locked.allowed,false);assert.equal(locked.locked,true);

 } finally { rmSync(compiled,{recursive:true,force:true}); }
});
