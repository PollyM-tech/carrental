# Movara remaining tasks

Updated 27 October 2026. This checklist is for development and project planning;
it must not be displayed in the application dashboard.

## Details to obtain from the client

- [ ] Security deposit amounts for each vehicle category, following the client's research.
- [ ] Deposit refund timing, deductions and settlement procedure.
- [ ] Contract copy containing cancellation deadlines/fees, insurance cover, excess and damage/theft liability.
- [ ] How transaction costs are established and the refund processing timeframe.
- [ ] Owner-supplied tracker device, supplier, subscription details and tested tamper alerts for each vehicle.
- [ ] Merchant till number and recipient details for M-Pesa collection. Do not use the business contact phone as a till number.

## Payments and handover

- [ ] Implement the final handover checklist and record the manually signed contract.
- [ ] Gate all rental-payment and deposit collection behind all required approvals, including physical clearance and manual contract signing.
- [ ] Add manual till payment instructions, transaction-code submission and admin receipt verification. A submitted code alone must not confirm payment.
- [ ] Record verified payment before authorizing vehicle release.
- [ ] Record the approved category deposit, collection at cleared handover and later settlement under the signed contract.
- [ ] Implement refund processing and records once the actual contract terms and transaction costs are supplied. Failed clearance normally means no money is collected; premature payments require exceptional refund handling.
- [ ] Implement immediate no-show release using an agreed pickup date/time, with contract-based handling of any charges.
- [ ] Add STK Push only if merchant credentials and integration are supplied and approved.

## Privacy and identification

- [ ] Implement customer access, correction and deletion requests in Convex.
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

The current app supports booking requests, in-person verification, approval and
return/conduct records; it does not collect payment or deposits. Return charges,
fuel/mileage obligations and deposit settlement follow the manually signed
contract. Staff management and audit/reporting dashboards are outside the current
scope and must not be reintroduced as pending dashboard cards.
