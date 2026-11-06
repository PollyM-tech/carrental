import assert from 'node:assert/strict';
import { createServer } from 'node:net';
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
  if(path==='/privacy'){const html=await r.text();assert.ok(html.includes('Information we use'));assert.ok(html.includes('Your cookie preferences'));assert.ok(html.includes('>Accept<'));assert.ok(html.includes('>Decline<'));}
 }
 for(const [path,target]of[['/workspace?car=test-vehicle','/sign-in'],['/dashboard','/movara-access']]){
  const r=await fetch(origin+path,{redirect:'manual',signal:AbortSignal.timeout(10000)});assert.equal(r.status,307);const location=new URL(r.headers.get('location'),origin);assert.equal(location.pathname,target);if(path.includes('car='))assert.equal(location.searchParams.get('car'),'test-vehicle');
 }
 for(const [body,status] of [['{',400],['x'.repeat(17000),413]]){const r=await fetch(origin+'/api/enquiries',{method:'POST',headers:{'Content-Type':'application/json'},body,signal:AbortSignal.timeout(10000)});assert.equal(r.status,status);}
 console.log('PASS: built public/privacy/sign-in pages, Accept/Decline banner markup, security headers and anonymous customer/admin redirects.');
}catch(error){console.error(logs.slice(-2000));throw error;}
finally {
 if(child.exitCode===null){const ended=once(child,'exit');child.kill('SIGTERM');await Promise.race([ended,delay(3000)]);if(child.exitCode===null)child.kill('SIGKILL');}
}
