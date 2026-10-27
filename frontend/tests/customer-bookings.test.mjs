import test from "node:test";
import assert from "node:assert/strict";
import { normalisePhone, passwordProfile } from "../convex/lib/identity.ts";
import { bookingDates, requireBookingOwner } from "../convex/lib/booking_input.ts";

test("international phone formatting preserves the calling code", () => {
  for (const [raw, expected] of [["+44 7700 900123", "+447700900123"], ["+1 (202) 555-0123", "+12025550123"], ["+91 98765 43210", "+919876543210"], ["+49 1512 3456789", "+4915123456789"], ["+256 772 123456", "+256772123456"], ["0044 7700 900123", "+447700900123"]]) assert.equal(normalisePhone(raw), expected);
});
test("Kenyan local numbers remain accepted", () => {
  assert.equal(normalisePhone("0716 741 039"), "+254716741039");
  assert.equal(normalisePhone("0116 741 039"), "+254116741039");
  assert.equal(normalisePhone("254716741039"), "+254716741039");
});
test("phone validation rejects bad input and accepts E164 length boundaries", () => {
  for (const raw of ["", "+0123456789", "++447700900123", "+441234x567", "+123456", "+1234567890123456", "2025550123"]) assert.throws(() => normalisePhone(raw));
  assert.equal(normalisePhone("+1234567"), "+1234567");
  assert.equal(normalisePhone("+123456789012345"), "+123456789012345");
});
test("signup stores the international phone but never verification flags", () => {
  assert.deepEqual(passwordProfile({ email: "CUSTOMER@example.com", phone: "+1 (202) 555-0123", flow: "signUp", phoneVerificationTime: 1, roles: ["owner"] }, undefined), { email: "customer@example.com", phone: "+12025550123" });
  assert.throws(() => passwordProfile({ email: "customer@example.com", flow: "signUp" }, undefined));
});
test("existing users can sign in without entering a phone again", () => {
  assert.deepEqual(passwordProfile({ email: "customer@example.com", flow: "signIn" }, undefined), { email: "customer@example.com" });
});
test("booking dates use Nairobi today and exclusive return dates", () => {
  const now = Date.parse("2026-10-26T22:00:00Z");
  assert.equal(bookingDates("2026-10-27", "2026-10-30", now), 3);
  assert.throws(() => bookingDates("2026-10-26", "2026-10-30", now));
  assert.throws(() => bookingDates("2026-10-27", "2026-10-27", now));
  assert.throws(() => bookingDates("2026-02-30", "2026-03-03", now));
});
test("customers cannot act on someone else's booking requests", () => {
  assert.throws(() => requireBookingOwner({ customerId: "other" }, "current"));
  assert.throws(() => requireBookingOwner(null, "current"));
  assert.equal(requireBookingOwner({ customerId: "current" }, "current").customerId, "current");
});
