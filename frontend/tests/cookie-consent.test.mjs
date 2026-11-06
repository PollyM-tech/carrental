import test from 'node:test';
import assert from 'node:assert/strict';
import {readCookieChoice,consentCookie,optionalCookiesAllowed} from '../src/lib/cookie-consent.ts';
test('optional cookies require explicit current-version acceptance',()=>{
 for(const raw of ['', 'other=accepted', 'movara_cookie_choice=v0.accepted', 'movara_cookie_choice=v1.declined', 'movara_cookie_choice=anything'])assert.equal(optionalCookiesAllowed(raw),false);
 assert.equal(optionalCookiesAllowed('other=value; movara_cookie_choice=v1.accepted'),true);
 assert.equal(readCookieChoice('movara_cookie_choice=v1.declined'),'declined');
});
test('consent choice lasts six months, is secure on HTTPS and never replaces auth cookies',()=>{
 const accepted=consentCookie('accepted',true);assert.ok(accepted.includes('Max-Age=15552000'));assert.ok(accepted.includes('; Secure'));assert.ok(accepted.includes('SameSite=Lax'));
 assert.ok(!accepted.includes('convexAuth'));assert.ok(!consentCookie('declined',false).includes('; Secure'));
 assert.equal(readCookieChoice(accepted),'accepted');assert.equal(readCookieChoice(consentCookie('declined',true)),'declined');
});
