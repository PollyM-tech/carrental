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
const enquiries=await import(pathToFileURL(join(compiled,'enquiries.js')));
const handovers=await import(pathToFileURL(join(compiled,'handovers.js')));
const privacy=await import(pathToFileURL(join(compiled,'dataRequests.js')));
const bookings=await import(pathToFileURL(join(compiled,'bookingRequests.js')));
const care=await import(pathToFileURL(join(compiled,'customerCare.js')));
const vehicles=await import(pathToFileURL(join(compiled,'vehicles.js')));
const security=await import(pathToFileURL(join(compiled,'security.js')));
const sessionGuard=await import(pathToFileURL(join(compiled,'lib/session_guard.js')));
const gmail=await import(pathToFileURL(join(compiled,'gmail.js')));
const {default:nodemailer}=await import('nodemailer');
let id=0;
const rows=new Map();
const db={
 async get(key){return structuredClone(rows.get(key)??null)},
 async insert(table,doc){const key=`${table}:${++id}`;rows.set(key,{...structuredClone(doc),_id:key,_creationTime:Date.now()});return key},
 async patch(key,patch){const row=rows.get(key);if(!row)throw Error('Missing record');for(const [k,v] of Object.entries(patch)){if(v===undefined)delete row[k];else row[k]=structuredClone(v)}},
 async delete(key){rows.delete(key)},
 query(table){
  const constraints=[];let descending=false;
  const builder={withIndex(_index,fn){if(fn){const q={eq(field,value){constraints.push(row=>row[field]===value);return q},lt(field,value){constraints.push(row=>row[field]<value);return q}};fn(q)}return builder},order(order){descending=order==='desc';return builder},
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
test('Gmail reset action fixes sender, requires TLS, rejects injected recipients and hides SMTP failures',async()=>{
 const oldPassword=process.env.AUTH_GMAIL_APP_PASSWORD, original=nodemailer.createTransport;
 let sent, closed=0;
 try {
  process.env.AUTH_GMAIL_APP_PASSWORD='abcd efgh ijkl mnop';
  nodemailer.createTransport=options=>{
   assert.equal(options.host,'smtp.gmail.com');assert.equal(options.secure,true);assert.equal(options.port,465);
   assert.equal(options.auth.user,'movaracarhire@gmail.com');assert.equal(options.auth.pass,'abcdefghijklmnop');
   return {sendMail:async message=>{sent=message;return {accepted:['customer@example.com'],rejected:[]}},close:()=>closed++};
  };
  await run(gmail,'sendPasswordReset',null,{email:'customer@example.com',code:'a'.repeat(32)});
  assert.equal(sent.from,'Movara Car Hire <movaracarhire@gmail.com>');assert.ok(sent.text.includes('a'.repeat(32)));assert.equal(closed,1);
  await assert.rejects(run(gmail,'sendPasswordReset',null,{email:'customer@example.com\r\nBcc: other@example.com',code:'a'.repeat(32)}),/Invalid/);
  nodemailer.createTransport=()=>({verify:async()=>true,close:()=>{}});
  assert.deepEqual(await run(gmail,'verifySetup',null),{smtpReady:true});
  nodemailer.createTransport=()=>({sendMail:async()=>{throw Error('private SMTP server details')},close:()=>closed++});
  await assert.rejects(run(gmail,'sendPasswordReset',null,{email:'customer@example.com',code:'a'.repeat(32)}),/^Error: Password reset email could not be delivered\.$/);
  assert.equal(closed,2);
 } finally {nodemailer.createTransport=original;if(oldPassword===undefined)delete process.env.AUTH_GMAIL_APP_PASSWORD;else process.env.AUTH_GMAIL_APP_PASSWORD=oldPassword;}
});
test('CLI owner bootstrap creates only the designated owner and refuses overwriting any existing account',async()=>{
 try {
  const hash='test-only-hash-'.repeat(8);
  const userId=await run(security,'bootstrapOwner',null,{hashedSecret:hash});
  assert.equal((await db.get(userId)).email,'movaracarhire@gmail.com');
  const membership=await db.query('staffMemberships').withIndex('by_user',q=>q.eq('userId',userId)).unique();
  assert.deepEqual(membership.roles,['owner']);assert.equal(membership.active,true);
  await assert.rejects(run(security,'bootstrapOwner',null,{hashedSecret:'different-hash-'.repeat(8)}),/already exists/);
  assert.equal((await db.query('authAccounts').withIndex('userIdAndProvider',q=>q.eq('userId',userId)).unique()).secret,hash);
 } finally {rows.clear();sessionIds.clear();}
});
test('full in-person booking, approval and return flow enforces ownership and standing',async()=>{
 try {
 const owner=await db.insert('users',{email:'movaracarhire@gmail.com'}), customer=await db.insert('users',{email:'one@example.invalid'}), other=await db.insert('users',{email:'two@example.invalid'});
 for (const who of [owner, customer, other]) {
 await db.insert('authAccounts', { userId: who, provider: 'password', secret: 'test-hash', providerAccountId: who });
 await db.insert('movaraCredentialGuards', { userId: who, secretHash: 'test-hash', changedAt: Date.now()-1000 });
 sessionIds.set(who, await db.insert('authSessions', { userId: who, expirationTime: Date.now()+86400000 }));
 }
 const googleCustomer=await db.insert('users',{email:'google@example.invalid',emailVerificationTime:Date.now()});
 await db.insert('authAccounts',{userId:googleCustomer,provider:'google',providerAccountId:'google-test-sub'});
 await sessionGuard.prepareCredentialGuard(context(googleCustomer),googleCustomer);
 sessionIds.set(googleCustomer,await db.insert('authSessions',{userId:googleCustomer,expirationTime:Date.now()+86400000}));
 assert.ok(await sessionGuard.liveSession(context(googleCustomer)));
 await db.insert('authAccounts',{userId:googleCustomer,provider:'password',providerAccountId:'google@example.invalid',secret:'new-test-hash'});
 assert.equal(await sessionGuard.liveSession(context(googleCustomer)),null);
 await run(security,'completePasswordReset',null,{userId:googleCustomer});
 assert.equal(await db.get(sessionIds.get(googleCustomer)),null);
 sessionIds.set(googleCustomer,await db.insert('authSessions',{userId:googleCustomer,expirationTime:Date.now()+86400000}));
 assert.ok(await sessionGuard.liveSession(context(googleCustomer)));
 await db.insert('staffMemberships',{userId:owner,roles:['owner'],active:true});
 await db.insert('staffMemberships',{userId:other,roles:['owner'],active:true});
 const car=await db.insert('movaraVehicles',{name:'Test',category:'SUV',registration:'TEST123',archived:false,published:true,status:'available',insuranceExpiresOn:date(365),inspectionExpiresOn:date(365),pricePerDay:3500,seats:5,transmission:'Automatic',fuel:'Petrol',brand:'Test',model:'Test',location:'Nairobi',description:'',isFeatured:true});
 const request=(who,start=10)=>run(bookings,'create',who,{vehicleId:car,requestKey:crypto.randomUUID(),pickupDate:date(start),returnDate:date(start+3),pickupLocation:'Nairobi',phone:'+447700900123'});
 const first=await request(customer), overlap=await request(other), later=await request(other,20);
 assert.equal((await run(vehicles,'publicList',null,{})).length,1); // Pending requests do not hide a car.
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
 assert.equal((await run(vehicles,'publicList',null,{})).length,0); // Approval removes it from Featured/all-cars feeds.
 const customerBookings=await run(bookings,'mine',customer,{});
 assert.ok(customerBookings.some(row=>row._id===first));
 assert.ok(customerBookings.every(row=>row.customerId===customer));
 assert.equal(customerBookings.find(row=>row._id===first).displayImageUrl,null);
 assert.ok(!(await run(bookings,'mine',other,{})).some(row=>row._id===first));
 const firstVersion=(await db.get(first)).approvalVersion;
 await run(bookings,'approve',owner,{id:first});
 assert.equal((await db.get(first)).approvalVersion,firstVersion);
 await assert.rejects(run(bookings,'cancelApproval',customer,{id:first,approvalVersion:firstVersion,notHandedOverConfirmed:true}),/permission/);
 await assert.rejects(run(bookings,'cancelApproval',owner,{id:first,approvalVersion:firstVersion,notHandedOverConfirmed:false}),/not been handed over/);
 assert.equal((await db.get(first)).status,'approved');
 await assert.rejects(run(bookings,'review',owner,{id:first,status:'in_review'}),/Cancel approval/);
 await run(bookings,'cancelApproval',owner,{id:first,approvalVersion:firstVersion,notHandedOverConfirmed:true});
 assert.equal((await db.get(first)).status,'in_review');
 assert.equal((await run(vehicles,'publicList',null,{})).length,1);
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
 assert.equal((await run(vehicles,'publicList',null,{})).length,0); // Another approved rental keeps it hidden.
 await run(care,'recordReturn',owner,{bookingId:later,condition:'damage',rulesFollowed:false,disposition:'flagged',notes:'Damage recorded under contract',handedOverConfirmed:true});
 assert.equal((await run(vehicles,'publicList',null,{})).length,1); // The last approved rental is returned.
 assert.equal((await run(vehicles,'publicList',null,{}))[0].isFeatured,true); // Preserve the owner's Featured setting.
 assert.equal((await db.get(later)).status,'returned');
 // Optional fleet details can be omitted, cleared on edit and still requested without a fabricated quote.
 const minimalCar={name:'Quote-only car',category:'SUV',brand:'Test',model:'Optional',registration:'OPT123',description:'',isFeatured:false,status:'available',published:true,insuranceExpiresOn:date(365),inspectionExpiresOn:date(365)};
 const optionalCar=await run(vehicles,'save',owner,minimalCar);
 const publicOptional=(await run(vehicles,'publicList',null,{})).find(row=>row._id===optionalCar);
 assert.equal(publicOptional.pricePerDay,null);assert.equal(publicOptional.seats,null);assert.equal(publicOptional.transmission,'');
 const quoteRequest=await run(bookings,'create',customer,{vehicleId:optionalCar,requestKey:crypto.randomUUID(),pickupDate:date(40),returnDate:date(42),pickupLocation:'Nairobi',phone:'+447700900123'});
 assert.equal((await db.get(quoteRequest)).estimatedRentalKes,undefined);
 await run(vehicles,'save',owner,{...minimalCar,id:optionalCar,pricePerDay:4000,seats:5,mileage:0,transmission:'Manual',fuel:'Petrol',location:'Nairobi'});
 await run(vehicles,'save',owner,{...minimalCar,id:optionalCar});
 assert.equal((await db.get(optionalCar)).pricePerDay,undefined);assert.equal((await db.get(optionalCar)).seats,undefined);
 await assert.rejects(run(vehicles,'save',owner,{...minimalCar,id:optionalCar,pricePerDay:0}),/positive whole/);
 await assert.rejects(run(vehicles,'save',owner,{...minimalCar,id:optionalCar,mileage:-1}),/mileage/);
 await assert.rejects(run(vehicles,'save',owner,{...minimalCar,id:optionalCar,transmission:'Unknown'}),/transmission/);
 // Vehicle galleries preserve legacy covers, validate ownership, change cover and unlink removed photos.
 const scheduled=[];
 const galleryContext={...context(owner),scheduler:{runAfter:async(_delay,_fn,args)=>scheduled.push(args)},storage:{getUrl:async storageId=>`https://example.invalid/${storageId}`}};
 const saveGallery=args=>vehicles.save._handler(galleryContext,{...minimalCar,id:optionalCar,...args});
 const photoA=await db.insert('movaraVehiclePhotos',{storageId:'storage-a',uploaderId:owner,vehicleId:optionalCar});
 const photoB=await db.insert('movaraVehiclePhotos',{storageId:'storage-b',uploaderId:owner});
 const foreignPhoto=await db.insert('movaraVehiclePhotos',{storageId:'storage-foreign',uploaderId:other});
 await db.patch(optionalCar,{photoId:photoA});
 await saveGallery({});assert.deepEqual((await db.get(optionalCar)).photoIds,[photoA]);
 await saveGallery({photoIds:[photoB,photoA]});
 assert.equal((await db.get(optionalCar)).photoId,photoB);assert.equal((await db.get(photoB)).vehicleId,optionalCar);
 const publicGallery=(await vehicles.publicList._handler({...galleryContext,auth:context(null).auth},{})).find(row=>row._id===optionalCar);
 assert.deepEqual(publicGallery.imageUrls,['https://example.invalid/storage-b','https://example.invalid/storage-a']);
 await assert.rejects(saveGallery({photoIds:[foreignPhoto]}),/this account/);
 await assert.rejects(saveGallery({photoIds:[photoA,photoA]}),/different/);
 await assert.rejects(saveGallery({photoIds:Array.from({length:13},(_,i)=>`photo-${i}`)}),/12/);
 const otherCar=await run(vehicles,'save',owner,{...minimalCar,registration:'OPT456'});
 await assert.rejects(vehicles.save._handler(galleryContext,{...minimalCar,id:otherCar,registration:'OPT456',photoIds:[photoA]}),/this vehicle/);
 await saveGallery({photoIds:[photoB]});assert.equal((await db.get(photoA)).vehicleId,undefined);assert.ok(scheduled.some(job=>job.photoId===photoA));
 await saveGallery({photoIds:[]});assert.equal((await db.get(optionalCar)).photoId,undefined);assert.deepEqual((await db.get(optionalCar)).photoIds,[]);
 // Availability controls remove booked/maintenance vehicles from the public feed.
 await assert.rejects(run(vehicles,'setAvailability',customer,{id:optionalCar,status:'booked'}),/permission/);
 for (const status of ['booked','maintenance']) {
  await run(vehicles,'setAvailability',owner,{id:optionalCar,status});
  assert.equal((await db.get(optionalCar)).status,status);
  assert.ok(!(await run(vehicles,'publicList',null,{})).some(row=>row._id===optionalCar));
  await assert.rejects(run(bookings,'create',customer,{vehicleId:optionalCar,requestKey:crypto.randomUUID(),pickupDate:date(50),returnDate:date(52),pickupLocation:'Nairobi',phone:'+447700900123'}),/unavailable/);
 }
 await run(vehicles,'setAvailability',owner,{id:optionalCar,status:'available'});
 assert.ok((await run(vehicles,'publicList',null,{})).some(row=>row._id===optionalCar));
 await run(bookings,'approve',owner,{id:quoteRequest,manualClearance:{contractSigned:true,requirementsMet:true}});
 await assert.rejects(run(vehicles,'setAvailability',owner,{id:optionalCar,status:'available'}),/return or cancel/);
 assert.equal((await run(vehicles,'list',owner)).find(row=>row._id===optionalCar).hasApprovedBooking,true);
 await run(bookings,'cancelApproval',owner,{id:quoteRequest,approvalVersion:1,notHandedOverConfirmed:true});
 await run(vehicles,'setAvailability',owner,{id:optionalCar,status:'available'});
 // Category is optional, including on already saved vehicles.
 const noCategory={...minimalCar,id:otherCar,registration:'OPT456',category:undefined};
 await run(vehicles,'save',owner,noCategory);
 assert.equal((await db.get(otherCar)).category,undefined);
 assert.equal((await run(vehicles,'publicList',null,{})).find(row=>row._id===otherCar).category,'');
 // Manual receipt verification gates real release, refunds and deposit settlement.
 const paymentBooking=await run(bookings,'create',customer,{vehicleId:otherCar,requestKey:crypto.randomUUID(),pickupDate:date(0),returnDate:date(2),pickupLocation:'Nairobi',phone:'+447700900123'});
 const receipt={bookingId:paymentBooking,rentalKes:1000,depositKes:500,receivedKes:1500,receivingDetails:'Synthetic receiving details for handler tests only',transactionCode:'TESTPAY001',paidAt:Date.now(),contractSigned:true,clearanceConfirmed:true,receivingAccountChecked:true};
 await assert.rejects(run(handovers,'recordReceipt',owner,receipt),/Approve/);
 await run(bookings,'approve',owner,{id:paymentBooking,manualClearance:{contractSigned:true,requirementsMet:true}});
 await assert.rejects(run(handovers,'release',owner,{bookingId:paymentBooking,confirmed:true}),/verified receipt/);
 await assert.rejects(run(handovers,'recordReceipt',customer,receipt),/permission/);
 await assert.rejects(run(handovers,'recordReceipt',owner,{...receipt,contractSigned:false}),/signed paper/);
 await assert.rejects(run(handovers,'recordReceipt',owner,{...receipt,receivedKes:1400}),/must match/);
 await assert.rejects(run(handovers,'recordReceipt',owner,{...receipt,paidAt:Date.now()-86400000}),/payment time/);
 const receiptId=await run(handovers,'recordReceipt',owner,receipt);
 assert.equal(await run(handovers,'recordReceipt',owner,receipt),receiptId);
 const customerPaymentView=(await run(bookings,'mine',customer)).find(row=>row._id===paymentBooking);
 assert.equal(customerPaymentView.handoverReady,true);assert.equal(customerPaymentView.agreedRentalKes,1000);assert.equal('transactionCode' in customerPaymentView,false);
 await assert.rejects(run(bookings,'cancelApproval',owner,{id:paymentBooking,approvalVersion:1,notHandedOverConfirmed:true}),/payment/);
 const secondPaymentBooking=await run(bookings,'create',customer,{vehicleId:otherCar,requestKey:crypto.randomUUID(),pickupDate:date(5),returnDate:date(7),pickupLocation:'Nairobi',phone:'+447700900123'});
 await run(bookings,'approve',owner,{id:secondPaymentBooking,manualClearance:{contractSigned:true,requirementsMet:true}});
 await assert.rejects(run(handovers,'recordReceipt',owner,{...receipt,bookingId:secondPaymentBooking}),/another booking/);
 await run(handovers,'release',owner,{bookingId:paymentBooking,confirmed:true});
 assert.ok((await db.get(receiptId)).releasedAt);
 await assert.rejects(run(handovers,'recordRefund',owner,{bookingId:paymentBooking,refundedKes:1500,transactionCostKes:0,reference:'test-refund',reason:'Not a real refund',confirmed:true}),/pre-handover/);
 await run(care,'recordReturn',owner,{bookingId:paymentBooking,condition:'good',rulesFollowed:true,disposition:'clear',notes:'Handler-test return',handedOverConfirmed:true});
 await assert.rejects(run(handovers,'settleDeposit',owner,{bookingId:paymentBooking,returnedKes:400,deductionsKes:0,notes:'Incorrect total',confirmed:true}),/must match/);
 await run(handovers,'settleDeposit',owner,{bookingId:paymentBooking,returnedKes:500,deductionsKes:0,notes:'Handler-test deposit settled',confirmed:true});
 assert.equal((await db.get(receiptId)).depositSettlement.returnedKes,500);
 await run(handovers,'recordReceipt',owner,{...receipt,bookingId:secondPaymentBooking,transactionCode:'TESTPAY002'});
 await run(handovers,'recordRefund',owner,{bookingId:secondPaymentBooking,refundedKes:1480,transactionCostKes:20,reference:'test-refund',reason:'Handler-test documented transaction costs',confirmed:true});
 await assert.rejects(run(handovers,'release',owner,{bookingId:secondPaymentBooking,confirmed:true}),/verified receipt/);
 await run(bookings,'cancelApproval',owner,{id:secondPaymentBooking,approvalVersion:1,notHandedOverConfirmed:true});
 await assert.rejects(run(bookings,'approve',owner,{id:secondPaymentBooking,manualClearance:{contractSigned:true,requirementsMet:true}}),/refunded/);
 // Privacy requests enforce ownership, review permissions and rental-retention holds.
 await run(privacy,'create',customer,{kind:'access',details:'Please provide my account data.'});
 const accessRequest=(await run(privacy,'mine',customer))[0];
 assert.equal((await run(privacy,'mine',other)).length,0);
 await assert.rejects(run(privacy,'list',customer),/permission/);
 await assert.rejects(run(privacy,'create',customer,{kind:'access',details:'Duplicate'}),/open request/);
 const exported=await run(privacy,'exportMine',customer);
 assert.equal(exported.account.email,'one@example.invalid');assert.ok(!JSON.stringify(exported).includes('test-hash'));
 assert.ok(exported.bookings.every(row=>row.reference!==overlap));
 await assert.rejects(run(privacy,'review',customer,{id:accessRequest._id,status:'completed',customerMessage:'Done'}),/permission/);
 await run(privacy,'review',owner,{id:accessRequest._id,status:'completed',customerMessage:'Your download is available in your dashboard.'});
 await run(privacy,'create',customer,{kind:'deletion',details:'Please delete my account.'});
 const held=(await run(privacy,'mine',customer)).find(row=>row.kind==='deletion');
 await assert.rejects(run(privacy,'review',owner,{id:held._id,status:'completed',customerMessage:'Deleted'}),/Delete account/);
 await assert.rejects(run(privacy,'eraseAccount',owner,{id:held._id,confirmed:true}),/retention review/);
 assert.ok(await db.get(customer));
 const disposable=await db.insert('users',{email:'privacy-test@example.invalid'});
 await db.insert('authAccounts',{userId:disposable,provider:'password',providerAccountId:'privacy-test@example.invalid',secret:'private-test-hash'});
 await db.insert('movaraCredentialGuards',{userId:disposable,secretHash:'private-test-hash',changedAt:Date.now()-1000});
 sessionIds.set(disposable,await db.insert('authSessions',{userId:disposable,expirationTime:Date.now()+86400000}));
 const pendingDeletionBooking=await run(bookings,'create',disposable,{vehicleId:otherCar,requestKey:crypto.randomUUID(),pickupDate:date(60),returnDate:date(62),pickupLocation:'Nairobi',phone:'+447700900123'});
 await run(privacy,'create',disposable,{kind:'deletion',details:'Remove my account and pending booking.'});
 const deletion=(await run(privacy,'mine',disposable))[0];
 await assert.rejects(run(privacy,'eraseAccount',owner,{id:deletion._id,confirmed:false}),/Confirm/);
 await run(privacy,'eraseAccount',owner,{id:deletion._id,confirmed:true});
 assert.equal(await db.get(disposable),null);assert.equal(await db.get(pendingDeletionBooking),null);assert.equal(await db.get(sessionIds.get(disposable)),null);
 assert.equal((await db.query('authAccounts').withIndex('userIdAndProvider',q=>q.eq('userId',disposable)).collect()).length,0);
 assert.equal((await db.get(deletion._id)).details,'Removed after account deletion');
 await assert.rejects(run(privacy,'exportMine',disposable),/Sign in/);
 await run(privacy,'create',owner,{kind:'deletion',details:'Do not delete the protected owner.'});
 const ownerRequest=(await run(privacy,'mine',owner))[0];
 await assert.rejects(run(privacy,'eraseAccount',owner,{id:ownerRequest._id,confirmed:true}),/cannot be deleted/);
 // Public enquiries are persisted before WhatsApp details are returned, without creating customer accounts.
 const enquiryContext={runMutation:async(_reference,args)=>run(enquiries,'persist',null,args)};
 const enquiry={requestKey:crypto.randomUUID(),kind:'booking',name:'Guest Customer',phone:'0716741039',email:'guest@example.invalid',vehicle:'Test Vehicle',pickupDate:date(1)+'T09:00',returnDate:date(1)+'T17:00',pickupLocation:'Nairobi',returnLocation:'Nairobi',message:'Please confirm availability.',website:''};
 const guest=await enquiries.submit._handler(enquiryContext,enquiry);
 assert.equal((await db.get(guest.reference)).phone,'+254716741039');assert.equal((await db.get(guest.reference)).status,'new');
 assert.equal((await enquiries.submit._handler(enquiryContext,enquiry)).reference,guest.reference);
 await assert.rejects(enquiries.submit._handler(enquiryContext,{...enquiry,name:'Changed details'}),/different details/);
 await assert.rejects(enquiries.submit._handler(enquiryContext,{...enquiry,requestKey:crypto.randomUUID(),website:'bot'}),/refresh/);
 await assert.rejects(enquiries.submit._handler(enquiryContext,{...enquiry,requestKey:crypto.randomUUID(),returnDate:enquiry.pickupDate}),/return must be after/);
 await assert.rejects(run(enquiries,'list',customer),/permission/);
 await assert.rejects(run(enquiries,'review',customer,{id:guest.reference,status:'contacted'}),/permission/);
 await run(enquiries,'review',owner,{id:guest.reference,status:'contacted'});
 assert.equal((await run(enquiries,'list',owner)).find(row=>row._id===guest.reference).status,'contacted');
 for(let n=0;n<4;n++)await enquiries.submit._handler(enquiryContext,{...enquiry,requestKey:crypto.randomUUID()});
 await assert.rejects(enquiries.submit._handler(enquiryContext,{...enquiry,requestKey:crypto.randomUUID()}),/Too many/);
 const globalGuard=await db.query('movaraEnquiryLimits').withIndex('by_key',q=>q.eq('key','day:'+today)).unique();
 assert.equal(globalGuard.count,5);await db.patch(globalGuard._id,{count:100});
 await assert.rejects(enquiries.submit._handler(enquiryContext,{...enquiry,phone:'+447700900999',requestKey:crypto.randomUUID()}),/Too many/);
 await db.patch(globalGuard._id,{count:5});
 const expiredGuard=await db.insert('movaraEnquiryLimits',{key:'old-guard',day:date(-5),count:1});
 await run(enquiries,'cleanupLimits',null);assert.equal(await db.get(expiredGuard),null);assert.ok(await db.get(globalGuard._id));
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
