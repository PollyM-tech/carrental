import test from 'node:test';
import assert from 'node:assert/strict';
import { reservedConflict, canEditVerification, requireVerificationChecks, requireReturnOutcome } from '../convex/lib/rental_checks.ts';
test('approved bookings block overlaps but allow adjacent rentals', () => {
 const rentals = [{ _id: 'a', status: 'approved', pickupDate: '2027-01-10', returnDate: '2027-01-13' }];
 assert.equal(reservedConflict(rentals, '2027-01-12', '2027-01-15'), true);
 assert.equal(reservedConflict(rentals, '2027-01-13', '2027-01-15'), false);
 assert.equal(reservedConflict(rentals, '2027-01-08', '2027-01-10'), false);
 assert.equal(reservedConflict(rentals, '2027-01-10', '2027-01-13', 'a'), false);
});
test('unreturned cars remain blocked regardless of original rental dates', () => {
 const rental = { status: 'overdue', pickupDate: '2027-01-01', returnDate: '2027-01-03' };
 assert.equal(reservedConflict([rental], '2027-02-01', '2027-02-05'), true);
 for (const status of ['requested', 'in_review', 'returned', 'cancelled']) assert.equal(reservedConflict([{ ...rental, status }], '2027-01-01', '2027-01-04'), false);
});
test('verification edits freeze after approval or closure', () => {
 assert.equal(canEditVerification('requested'), true); assert.equal(canEditVerification('in_review'), true);
 for (const status of ['approved', 'overdue', 'returned', 'cancelled']) assert.equal(canEditVerification(status), false);
});
test('every original-document and eligibility check is required for approval', () => {
 const checks = { phoneChecked: true, identityChecked: true, licenceChecked: true, ageChecked: true, licenceTenureChecked: true, contactsChecked: true };
 assert.doesNotThrow(() => requireVerificationChecks(checks));
 for (const key of Object.keys(checks)) assert.throws(() => requireVerificationChecks({ ...checks, [key]: false }));
});
test('condition or rule issues require a flag or second-chance decision', () => {
 assert.doesNotThrow(() => requireReturnOutcome('good', true, 'clear'));
 for (const [condition, rules] of [['damage', true], ['not_returned', false], ['good', false]]) {
  assert.throws(() => requireReturnOutcome(condition, rules, 'clear'));
  for (const decision of ['flagged', 'second_chance']) assert.doesNotThrow(() => requireReturnOutcome(condition, rules, decision));
 }
});
