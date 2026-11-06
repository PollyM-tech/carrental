# Movara remaining tasks

Updated 6 November 2026. This checklist is for development and project planning;
it must not be displayed in the application dashboard.

## Details to obtain from the client

- [ ] Security deposit amounts for each vehicle category, following the client's research.
- [ ] Deposit refund timing, deductions and settlement procedure.
- [ ] Contract copy containing cancellation deadlines/fees, insurance cover, excess and damage/theft liability.
- [ ] How transaction costs are established and the refund processing timeframe.
- [ ] Owner-supplied tracker device, supplier, subscription details and tested tamper alerts for each vehicle.
- [ ] Merchant till number and recipient details for M-Pesa collection. Do not use the business contact phone as a till number.

## Payments and handover

- [x] Record paper-contract clearance, verified receipt and vehicle release in Convex.
- [x] Gate payment recording and release behind approval, physical clearance and paper signing. Public payment collection remains closed.
- [ ] Add manual till payment instructions, transaction-code submission and admin receipt verification. A submitted code alone must not confirm payment.
- [x] Require a verified receipt before system-recorded vehicle release.
- [x] Record agreed per-booking deposits and checked settlement after return. Category amounts remain a client decision.
- [ ] Implement refund processing and records once the actual contract terms and transaction costs are supplied. Failed clearance normally means no money is collected; premature payments require exceptional refund handling.
- [ ] Implement immediate no-show release using an agreed pickup date/time, with contract-based handling of any charges.
- [ ] Add STK Push only if merchant credentials and integration are supplied and approved.

## Privacy and identification

- [x] Add customer data export and access/correction/deletion requests with owner review and eligible-account erasure. Rental/payment records require retention review.
- [ ] Before any future ID/licence uploads, approve the privacy notice and implement private storage, restricted access, seven-day retention after resolved rentals and unresolved-case holds.
- [ ] Verify retention deletion and access restrictions before collecting real identity files.

Current identification is in person, by client choice. Online document upload
remains closed. Do not add an upload requirement to the current booking flow.

## Owner-supplied trackers

- [ ] Record the supplied device, supplier and subscription details per vehicle.
- [ ] Integrate and test tamper/power-disconnection alerts once device capabilities are known.

## Final verification

- [ ] Complete live customer and owner workflow checks covering booking, in-person verification, approval, handover, payment verification and return/non-return records.
- [ ] Verify session expiry, password-change revocation and the five-attempt/15-minute login lock through the deployed app.
- [ ] Verify removal of historical synthetic test accounts and temporary internal test helpers.

The current app supports booking requests, in-person verification, approval,
verified manual receipt/release/refund/deposit records and return/conduct records.
It does not initiate payment or refund transfers. Return charges,
fuel/mileage obligations and deposit settlement follow the manually signed
contract. Staff management and audit/reporting dashboards are outside the current
scope and must not be reintroduced as pending dashboard cards.

Production hardening and cookie preferences are implemented. See
PRODUCTION_READINESS.md and PRODUCTION_TESTING.md for resolved code findings and
the remaining owner acceptance/operational checks. The till is not ready, so
public till instructions and online collection remain disabled.
