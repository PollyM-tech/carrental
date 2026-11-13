import test from 'node:test';
import assert from 'node:assert/strict';
import { referralSources, validateReferralSource } from '../convex/lib/referral.ts';
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
