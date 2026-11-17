import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
function setup(id, cookie) {
 const events = [];
 const dataLayer = [];
 const exports = {};
 const source = ts.transpileModule(readFileSync(new URL('../src/lib/analytics.ts', import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
 vm.runInNewContext(source, { exports, require: () => ({ optionalCookiesAllowed: value => value === 'accepted' }), process: { env: { NEXT_PUBLIC_GA_MEASUREMENT_ID: id } }, document: { cookie }, window: { dataLayer, location: { origin: 'https://www.movaracarhire.com', pathname: '/contact', search: '?name=private&phone=private' }, gtag: (...args) => events.push(args) } });
 return { events, dataLayer, analyticsId: exports.analyticsId, tagManagerId: exports.tagManagerId, send: exports.trackConversion };
}
test('GTM conversions require explicit consent', () => {
 for (const cookie of ['declined', 'unknown']) {
  const state = setup(undefined, cookie); state.send('enquiry_saved');
  assert.equal(state.dataLayer.length, 0);
  assert.equal(state.events.length, 0);
 }
});
test('GTM receives conversions without private query strings or direct GA4 events', () => {
 for (const id of [undefined, '', 'G-0K449R88PB']) {
  const state = setup(id, 'accepted'); state.send('enquiry_saved');
  assert.equal(state.tagManagerId, 'GTM-T7DP9KTX');
  assert.equal(state.dataLayer.length, 1);
  assert.equal(state.dataLayer[0].event, 'enquiry_saved');
  assert.equal(state.dataLayer[0].page_location, 'https://www.movaracarhire.com/contact');
  assert.ok(!JSON.stringify(state.dataLayer).includes('private'));
  assert.equal(state.events.length, 0);
 }
});
