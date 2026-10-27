import test from 'node:test';
import assert from 'node:assert/strict';
import { Password } from '@convex-dev/auth/providers/Password';
import { materializeCredentials } from '../convex/lib/credentials.js';

test('password maintenance hashes and verifies with the installed provider',async()=>{
 const provider=materializeCredentials(Password());
 assert.equal(provider.id,'password');
 assert.equal('options' in provider,false);
 assert.equal(typeof provider.crypto?.hashSecret,'function');
 const secret='Sample@123'; // Synthetic 10-character maintenance password; no signup-length validation here.
 const hash=await provider.crypto.hashSecret(secret);
 assert.notEqual(hash,secret);
 assert.equal(await provider.crypto.verifySecret(secret,hash),true);
 assert.equal(await provider.crypto.verifySecret('incorrect-synthetic-password',hash),false);
});
test('the actual Password authorize implementation and its profile are preserved',async()=>{
 let called=false;
 const provider=materializeCredentials(Password({profile(){called=true;throw new Error('PROFILE_VISITED');}}));
 await assert.rejects(provider.authorize({flow:'signIn',email:'test@example.invalid',password:'synthetic-password'},{}),/PROFILE_VISITED/);
 assert.equal(called,true);
 // No remaining options layer can replace a rate-limit wrapper during materialization.
 const wrapped=async()=>{throw new Error('WRAPPER_VISITED');};provider.authorize=wrapped;
 assert.equal(materializeCredentials(provider).authorize,wrapped);
});
