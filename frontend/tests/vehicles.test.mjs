import test from 'node:test';
import assert from 'node:assert/strict';
import { availableFor, catalogueReady, normaliseRegistration, calendarDate, positiveInteger, rentalEstimate, validatePhoto, overlaps } from '../convex/lib/vehicle_rules.ts';
const car = { archived: false, published: true, status: 'available', registration: 'KDA123A', insuranceExpiresOn: '2027-12-31', inspectionExpiresOn: '2027-12-31' };
test('registration and money reject malformed values', () => {
 assert.equal(normaliseRegistration(' kda 123a '), 'KDA123A');
 for (const value of ['', '<script>', 'A']) assert.throws(() => normaliseRegistration(value));
 for (const value of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => positiveInteger(value, 'Rate'));
 assert.equal(rentalEstimate(3500, 3), 10500);
 assert.throws(() => rentalEstimate(Number.MAX_SAFE_INTEGER, 2));
});
test('invalid calendar dates cannot create availability blocks', () => {
 assert.equal(calendarDate('2028-02-29'), '2028-02-29');
 for (const date of ['2027-02-29', '2026-13-01', '2026-2-01']) assert.throws(() => calendarDate(date));
});
test('maintenance blocks use exclusive end dates', () => {
 const blocks = [{ startsOn: '2027-01-03', endsOn: '2027-01-05' }];
 assert.equal(availableFor(car, '2027-01-01', '2027-01-03', blocks), true);
 assert.equal(availableFor(car, '2027-01-05', '2027-01-07', blocks), true);
 assert.equal(availableFor(car, '2027-01-02', '2027-01-04', blocks), false);
 assert.equal(overlaps('2027-01-01', '2027-01-07', '2027-01-03', '2027-01-05'), true);
});
test('unpublished, archived and non-compliant vehicles cannot be requested', () => {
 for (const changes of [{ archived: true }, { published: false }, { status: 'maintenance' }, { status: 'unavailable' }, { registration: '' }, { insuranceExpiresOn: undefined }, { inspectionExpiresOn: '2027-01-02' }]) assert.equal(availableFor({ ...car, ...changes }, '2027-01-01', '2027-01-03', []), false);
 assert.equal(catalogueReady(car, '2028-01-01'), false);
 assert.equal(availableFor(car, '2027-12-30', '2027-12-31', []), true);
});
test('photo uploads reject SVG, mismatched content and excessive size', () => {
 const png = Uint8Array.from([137,80,78,71,13,10,26,10]).buffer;
 assert.doesNotThrow(() => validatePhoto(png, 'image/png'));
 assert.throws(() => validatePhoto(png, 'image/jpeg'));
 assert.throws(() => validatePhoto(new TextEncoder().encode('<svg/>').buffer, 'image/svg+xml'));
 assert.throws(() => validatePhoto(new ArrayBuffer(0), 'image/png'));
 assert.throws(() => validatePhoto(new ArrayBuffer(2*1024*1024+1), 'image/png'));
});
