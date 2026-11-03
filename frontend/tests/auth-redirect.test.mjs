import test from 'node:test';
import assert from 'node:assert/strict';
import { authRedirect } from '../convex/lib/auth_redirect.ts';
const primary='https://www.movaracarhire.com';
test('OAuth return preserves the exact allowed starting origin and selected vehicle',()=>{
 for(const origin of [primary,'https://movaracarhire.com','https://carrental-pi-ten.vercel.app']) {
  assert.equal(authRedirect(`${origin}/sign-in?car=abc`,primary),`${origin}/sign-in?car=abc`);
 }
 assert.equal(authRedirect('/workspace',primary),primary+'/workspace');
 assert.equal(authRedirect('http://localhost:3000/sign-in',primary,'http://localhost:3000'),'http://localhost:3000/sign-in');
});
test('OAuth return rejects external and deceptive domains, unknown routes and unconfigured local hosts',()=>{
 for(const url of ['https://evil.example/sign-in','//evil.example/sign-in','https://www.movaracarhire.com.evil.example/sign-in','https://user:pass@www.movaracarhire.com/sign-in','http://localhost:3000/sign-in',primary+'/api/auth']) assert.throws(()=>authRedirect(url,primary),/Invalid/);
});
