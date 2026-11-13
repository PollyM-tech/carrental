import assert from 'node:assert/strict';
import { createServer } from 'node:net';
import { get } from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { setTimeout as delay } from 'node:timers/promises';
const reserve=createServer();reserve.listen(0,'127.0.0.1');await once(reserve,'listening');const port=reserve.address().port;await new Promise(resolve=>reserve.close(resolve));
const origin=`http://127.0.0.1:${port}`;
const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{env:{...process.env,NODE_ENV:'production',NEXT_PUBLIC_CONVEX_URL:process.env.NEXT_PUBLIC_CONVEX_URL??'https://flexible-mammoth-262.eu-west-1.convex.cloud',NEXT_PUBLIC_CONVEX_SITE_URL:process.env.NEXT_PUBLIC_CONVEX_SITE_URL??'https://flexible-mammoth-262.eu-west-1.convex.site'},stdio:['ignore','pipe','pipe']});
let logs='';child.stdout.on('data',data=>logs+=data);child.stderr.on('data',data=>logs+=data);
let spawnError;child.on('error',error=>{spawnError=error;});
try {
 let ready=false;
 for(let attempt=0;attempt<80;attempt++){
  if(spawnError)throw spawnError;
  if(child.exitCode!==null)throw Error('Production server exited before becoming ready.');
  try{const r=await fetch(origin+'/privacy',{signal:AbortSignal.timeout(1000)});if(r.status===200){ready=true;break;}}catch{}
  await delay(250);
 }
 assert.ok(ready,'Production server must become ready');
 for(const path of ['/','/privacy','/sign-in','/movara-access']){
  const r=await fetch(origin+path,{redirect:'manual',signal:AbortSignal.timeout(10000)});assert.equal(r.status,200,path);
  assert.equal(r.headers.get('x-content-type-options'),'nosniff');assert.equal(r.headers.get('x-frame-options'),'DENY');
  if(path==='/'){const html=await r.text();assert.ok(!html.includes('Loading featured vehicles'));assert.ok(html.includes('Before you book'));assert.ok(html.includes('Guarantor and next-of-kin'));assert.ok(html.includes('Germany'));}
  if(path==='/privacy'){const html=await r.text();assert.ok(html.includes('Information we use'));assert.ok(html.includes('Your cookie preferences'));assert.ok(html.includes('>Accept<'));assert.ok(html.includes('>Decline<'));}
 }
 // SEO must be present in HTTP HTML without running JavaScript.
 for (const [path, title] of [['/cars', 'Self-Drive Cars for Hire in Nairobi'], ['/contact?car=Toyota%20Prado', 'Contact &amp; Booking Enquiries'], ['/services', 'Car Hire Services in Kenya'], ['/rental-terms', 'Rental Requirements &amp; Terms']]) {
  const response = await fetch(origin + path, { signal: AbortSignal.timeout(20000) });
  assert.equal(response.status, 200, path);
  const html = await response.text();
  assert.ok(html.includes(title), `${path} has its own title`);
  assert.ok(html.includes(`rel="canonical" href="https://www.movaracarhire.com${path.split('?')[0]}"`), `${path} has its own canonical`);
  assert.ok(!html.includes('0706 040 984'));
  if (path === '/cars') assert.ok(!html.includes('Loading vehicles'), 'Fleet data should be rendered on the server');
  if (path.startsWith('/contact')) {
   assert.ok(html.includes('Toyota Prado'));
   assert.ok(html.includes('Jade Plaza'));
   assert.ok(html.includes('All our vehicles are based in Nairobi'));
   assert.ok(html.includes('Where did you hear about us?'));
   assert.ok(html.includes('tel:+254716741039'));
   assert.ok(!html.includes('Loading contact form'));
  }
 }
 const verification = await fetch(origin + '/googlee68182d218969c59.html');
 assert.equal(verification.status, 200);
 assert.equal((await verification.text()).trim(), 'google-site-verification: googlee68182d218969c59.html');
 const service = await fetch(origin + '/services/long-term-car-rental');
 assert.equal(service.status, 200); assert.ok((await service.text()).includes('Is there a weekly or monthly discount?'));
 const shareImage = await fetch(origin + '/opengraph-image');
 assert.equal(shareImage.status, 200); assert.ok(shareImage.headers.get('content-type').includes('image/png'));
 const apex = await new Promise((resolve, reject) => {
  get(origin + '/cars?category=SUV', { headers: { host: 'movaracarhire.com' } }, response => { response.resume(); resolve({ status: response.statusCode, location: response.headers.location }); }).on('error', reject);
 });
 assert.equal(apex.status, 308); assert.equal(apex.location, 'https://www.movaracarhire.com/cars?category=SUV');
 for(const [path,target]of[['/workspace?car=test-vehicle','/sign-in'],['/dashboard','/movara-access']]){
  const r=await fetch(origin+path,{redirect:'manual',signal:AbortSignal.timeout(10000)});assert.equal(r.status,307);const location=new URL(r.headers.get('location'),origin);assert.equal(location.pathname,target);if(path.includes('car='))assert.equal(location.searchParams.get('car'),'test-vehicle');
 }
 for(const [body,status] of [['{',400],['x'.repeat(17000),413]]){const r=await fetch(origin+'/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body,signal:AbortSignal.timeout(10000)});assert.equal(r.status,status);}
 console.log('PASS: public-page metadata and canonicals, contact HTML, verification file, service detail, social image, domain redirect, cookie banner, security headers and protected routes.');
}catch(error){console.error(logs.slice(-2000));throw error;}
finally {
 if(child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await Promise.race([ended,delay(3000)]);if(child.exitCode===null)child.kill('SIGKILL');}
}
