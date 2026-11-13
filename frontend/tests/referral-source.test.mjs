import test from 'node:test';
import assert from 'node:assert/strict';
import { referralSources, validateReferralSource, validateReferralDetails } from '../convex/lib/referral.ts';
import { bookingWhatsAppUrl } from '../src/lib/booking-whatsapp.ts';
test('referral sources accept dropdown choices and preserve older requests without a source', () => {
  for (const source of referralSources) assert.equal(validateReferralSource(source), source);
  assert.equal(validateReferralSource(undefined), undefined);
  assert.equal(validateReferralSource(''), undefined);
  assert.throws(() => validateReferralSource('unrecognised source'), /valid referral source/);
});
test('booking WhatsApp message includes the selected referral source', () => {
  const url = new URL(bookingWhatsAppUrl({ reference: 'booking-123', referralSource: 'Friend / Family referral' }));
  assert.ok(url.searchParams.get('text').includes('Where did you hear about us?: Friend / Family referral'));
});

test('referral details trim input, limit size, and require a selected source', () => {
  assert.equal(validateReferralDetails('  Nairobi travel group  ', 'Facebook'), 'Nairobi travel group');
  assert.equal(validateReferralDetails(undefined), undefined);
  assert.throws(() => validateReferralDetails('group', ''), /Choose where/);
  assert.throws(() => validateReferralDetails('x'.repeat(301), 'Reddit'), /300 characters/);
  const url = new URL(bookingWhatsAppUrl({ reference: 'booking-123', referralSource: 'Facebook', referralDetails: 'Nairobi travel group' }));
  assert.ok(url.searchParams.get('text').includes('Referral details: Nairobi travel group'));
});
