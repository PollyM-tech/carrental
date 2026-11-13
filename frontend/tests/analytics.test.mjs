import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function setup(id, cookie) {
 const events = [];
 const exports = {};
 const source = ts.transpileModule(readFileSync(new URL('../src/lib/analytics.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
 vm.runInNewContext(source, { exports, require: () => ({ optionalCookiesAllowed: value => value === 'accepted' }), process: { env: { NEXT_PUBLIC_GA_MEASUREMENT_ID: id } }, document: { cookie }, window: { location: { origin: 'https://www.movaracarhire.com', pathname: '/contact', search: '?name=private&phone=private' }, gtag: (...args) => events.push(args) } });
 return { events, send: exports.trackConversion };
}
test('analytics needs a valid measurement ID and explicit consent', () => {
 for (const [id, cookie] of [[undefined, 'accepted'], ['bad-id', 'accepted'], ['G-ABC123', 'declined'], ['G-ABC123', 'unknown']]) {
  const { events, send } = setup(id, cookie); send('enquiry_saved'); assert.equal(events.length, 0);
 }
});
test('conversion events exclude query strings and customer information', () => {
 const { events, send } = setup('G-ABC123', 'accepted'); send('enquiry_saved');
 assert.equal(events.length, 1); assert.equal(events[0][1], 'enquiry_saved');
 assert.equal(events[0][2].page_location, 'https://www.movaracarhire.com/contact');
 assert.ok(!JSON.stringify(events).includes('private'));
});
