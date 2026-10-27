import test from 'node:test';
import assert from 'node:assert/strict';
import { isConnectionError, retryConnectionRead } from '../src/lib/connection-errors.ts';
test('network errors are distinguished from credentials and business-rule failures',()=>{
 for(const error of [new TypeError('fetch failed'),{cause:{code:'ETIMEDOUT'}},{errors:[{code:'EAI_AGAIN'}]},new Error('Unable to reach Movara. Check your connection and try again.')])assert.equal(isConnectionError(error),true);
 for(const error of [new Error('Invalid password'),new Error('LOGIN_LOCKED'),new Error('Vehicle unavailable'),null])assert.equal(isConnectionError(error),false);
});
test('a transient account read is retried once',async()=>{
 let count=0;const value=await retryConnectionRead(async()=>{if(++count===1)throw new TypeError('fetch failed');return {staff:true};},0);
 assert.deepEqual(value,{staff:true});assert.equal(count,2);
});
test('persistent outages stop after one retry; credential errors never retry',async()=>{
 let count=0;await assert.rejects(retryConnectionRead(async()=>{count++;throw new TypeError('fetch failed');},0));assert.equal(count,2);
 count=0;await assert.rejects(retryConnectionRead(async()=>{count++;throw new Error('Invalid password');},0));assert.equal(count,1);
});
