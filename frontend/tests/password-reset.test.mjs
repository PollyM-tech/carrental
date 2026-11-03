import test from 'node:test';
import assert from 'node:assert/strict';
import { passwordReset, passwordResetConfigured } from '../convex/passwordReset.ts';

test('reset email requires configuration and sends a short-lived code without leaking provider errors', async () => {
 const oldKey=process.env.AUTH_RESEND_KEY, oldFrom=process.env.AUTH_EMAIL_FROM, oldFetch=globalThis.fetch;
 try {
  delete process.env.AUTH_RESEND_KEY; delete process.env.AUTH_EMAIL_FROM;
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
  globalThis.fetch=oldFetch;
 }
});

