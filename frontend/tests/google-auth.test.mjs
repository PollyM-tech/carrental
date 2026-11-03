import test from 'node:test';
import assert from 'node:assert/strict';
import {googleProfile} from '../convex/lib/google_identity.ts';
test('Google profile requires a verified email and keeps owner on private password login',()=>{
 assert.deepEqual(googleProfile({sub:'google-id',email:' Customer@Example.com ',email_verified:true,name:'Customer'}),{id:'google-id',email:'customer@example.com',emailVerified:true,name:'Customer'});
 assert.throws(()=>googleProfile({sub:'id',email:'customer@example.com',email_verified:false}),/verified/);
 assert.throws(()=>googleProfile({email:'customer@example.com',email_verified:true}),/verified/);
 assert.throws(()=>googleProfile({sub:'id',email:'MOVARACARHIRE@gmail.com',email_verified:true}),/private admin/);
});
