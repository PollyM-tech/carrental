import test from 'node:test';
import assert from 'node:assert/strict';
import { beginLogin, finishLogin, sessionStillValid, WARNING_AFTER_MS, IDLE_EXPIRES_AFTER_MS, LOGIN_LOCK_MS } from '../convex/lib/security_policy.ts';
test('five failed attempts lock the account for exactly fifteen minutes',()=>{
 let state=null;let now=1000;
 for(let n=0;n<5;n++){const begin=beginLogin(state,`attempt-${n}`,now);assert.equal(begin.allowed,true);state=finishLogin(begin.state,`attempt-${n}`,false,now);now++;}
 assert.equal(beginLogin(state,'sixth',now).allowed,false);
 assert.equal(state.lockedUntil,1004+LOGIN_LOCK_MS);
 assert.equal(beginLogin(state,'early',state.lockedUntil-1).allowed,false);
 const retry=beginLogin(state,'after-wait',state.lockedUntil);assert.equal(retry.allowed,true);assert.equal(retry.state.failures,0);
});
test('a correct fifth attempt resets the failure streak',()=>{
 let state=null;
 for(let n=0;n<4;n++)state=finishLogin(beginLogin(state,String(n),0).state,String(n),false,0);
 state=finishLogin(beginLogin(state,'correct',0).state,'correct',true,0);
 assert.equal(state.failures,0);assert.equal(state.lockedUntil,undefined);assert.equal(beginLogin(state,'next',0).allowed,true);
});
test('parallel attempts cannot exceed the available attempt slots',()=>{
 let state=null;
 for(let n=0;n<5;n++)state=beginLogin(state,String(n),0).state;
 assert.equal(beginLogin(state,'sixth',1).allowed,false);
 assert.equal(beginLogin(state,'abandoned',90000).allowed,true);
 state=finishLogin(state,'0',true,2);
 assert.equal(finishLogin(state,'1',false,3).failures,0);
});
test('warnings begin at thirty minutes and expiry is one minute later',()=>{
 assert.equal(WARNING_AFTER_MS,30*60*1000);assert.equal(IDLE_EXPIRES_AFTER_MS-WARNING_AFTER_MS,60000);
 const session={userId:'user',_creationTime:1000,expirationTime:99999999};const guard={secretHash:'hash',changedAt:1000};
 assert.equal(sessionStillValid(session,'user',guard,'hash',1000,1000+IDLE_EXPIRES_AFTER_MS-1),true);
 assert.equal(sessionStillValid(session,'user',guard,'hash',1000,1000+IDLE_EXPIRES_AFTER_MS),false);
});
test('deleted sessions, changed passwords and older sessions lose access immediately',()=>{
 const session={userId:'user',_creationTime:1000,expirationTime:99999999};const guard={secretHash:'hash',changedAt:1000};
 for(const [s,u,g,hash] of [[null,'user',guard,'hash'],[session,'other',guard,'hash'],[session,'user',null,'hash'],[session,'user',guard,'new-password-hash'],[session,'user',{...guard,changedAt:1001},'hash']])assert.equal(sessionStillValid(s,u,g,hash,1000,1100),false);
});
