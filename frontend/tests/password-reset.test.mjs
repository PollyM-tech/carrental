import test from 'node:test';
import assert from 'node:assert/strict';
import { passwordReset, passwordResetConfigured } from '../convex/passwordReset.ts';

test('reset email requires configuration and sends a short-lived code without leaking provider errors', async () => {
 const oldKey=process.env.AUTH_RESEND_KEY, oldFrom=process.env.AUTH_EMAIL_FROM, oldGmail=process.env.AUTH_GMAIL_APP_PASSWORD, oldFetch=globalThis.fetch;
 try {
  delete process.env.AUTH_RESEND_KEY; delete process.env.AUTH_EMAIL_FROM; delete process.env.AUTH_GMAIL_APP_PASSWORD;
  assert.equal(passwordResetConfigured(),false);
  await assert.rejects(passwordReset.sendVerificationRequest({identifier:'test@example.com',token:'test-code'}),/not configured/);
  process.env.AUTH_RESEND_KEY='test-key'; process.env.AUTH_EMAIL_FROM='Movara <support@example.com>';
  assert.equal(passwordResetConfigured(),true);
  assert.equal(passwordReset.options.maxAge,900);
  const code=await passwordReset.options.generateVerificationToken();
  assert.match(code,/^[a-f0-9]{32}$/);
  globalThis.fetch=async(url,options)=>{
   assert.equal(url,'https://api.resend.com/emails');
   const body=JSON.parse(options.body);
   assert.equal(body.to,'test@example.com'); assert.equal(body.from,process.env.AUTH_EMAIL_FROM);
   assert.ok(body.text.includes(code)); assert.ok(body.text.includes('15 minutes'));
   return {ok:true};
  };
  await passwordReset.sendVerificationRequest({identifier:'test@example.com',token:code});
  globalThis.fetch=async()=>({ok:false,json:async()=>({secret:'must-not-leak'})});
  await assert.rejects(passwordReset.sendVerificationRequest({identifier:'test@example.com',token:code}),/^Error: Password reset email could not be delivered\.$/);
 } finally {
  if(oldKey===undefined) delete process.env.AUTH_RESEND_KEY; else process.env.AUTH_RESEND_KEY=oldKey;
  if(oldFrom===undefined) delete process.env.AUTH_EMAIL_FROM; else process.env.AUTH_EMAIL_FROM=oldFrom;
  if(oldGmail===undefined) delete process.env.AUTH_GMAIL_APP_PASSWORD; else process.env.AUTH_GMAIL_APP_PASSWORD=oldGmail;
  globalThis.fetch=oldFetch;
 }
});


test('Gmail reset delivery delegates only to the internal sender and propagates failures',async()=>{
 const old=process.env.AUTH_GMAIL_APP_PASSWORD;
 try {
  process.env.AUTH_GMAIL_APP_PASSWORD='abcd efgh ijkl mnop';
  assert.equal(passwordResetConfigured(),true);
  const code='a'.repeat(32);
  let calls=0;
  const ctx={runAction:async(_fn,args)=>{calls++;assert.deepEqual(args,{email:'test@example.com',code});}};
  await passwordReset.sendVerificationRequest({identifier:'test@example.com',token:code},ctx);
  assert.equal(calls,1);
  await assert.rejects(passwordReset.sendVerificationRequest({identifier:'test@example.com',token:code},{runAction:async()=>{throw new Error('Password reset email could not be delivered.')}}),/could not be delivered/);
  await assert.rejects(passwordReset.sendVerificationRequest({identifier:'test@example.com',token:code}),/context unavailable/);
 } finally {if(old===undefined)delete process.env.AUTH_GMAIL_APP_PASSWORD;else process.env.AUTH_GMAIL_APP_PASSWORD=old;}
});
