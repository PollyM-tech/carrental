# Manual M-Pesa payments

## Payment sequence clarification — October 27, 2026

This clarification supersedes any earlier instruction to collect payment after online KYC alone. Collect neither rental payment nor a security deposit until **all stages are approved**, including physical identity/document checks and the manually signed contract at handover. Then collect and verify the required payment before releasing the vehicle. Failed clearance means no collection and no vehicle release. If funds were paid prematurely, handle the exceptional refund under the previously stated contract terms (full amount paid less transaction costs); do not collect funds in anticipation of failure. Deposit amounts remain pending.

The current Convex flow collects no payments. Its future payment gate must require final handover clearance; legacy Django payment instructions below do not implement this updated sequence and must not be used to collect early payment.


## Client decision — October 27, 2026

Security deposits are paid at handover, not online. Category amounts await client research; deposit refund/settlement details are still pending. Failed physical identity/document checks qualify for a refund of the full amount paid less transaction costs, under the manually signed contract. Do not invent fees, a refund deadline or cancellation penalties. No-show release is immediate at the missed pickup time; cancellation charges and insurance liabilities follow the contract. Obtain its actual terms before automating calculations.

The instructions below describe the legacy Django implementation. Payments, deposit settlement, handover/no-show release and refund processing are not active in the current Convex booking-request flow. These decisions do not initiate a charge or refund.

Updated October 26, 2026: new payments use a Buy Goods till. The till number is awaiting the client; do not reuse the contact phone as a till. Manual transaction-code submission requires finance verification before confirmation. STK Push is requested but remains pending merchant credentials and integration; no STK prompt is currently sent. The app adds no surcharge.

## Setup

Set these backend environment variables:

```
PAYMENT_PROVIDER=manual_mpesa
MPESA_TILL_NUMBER=<client-supplied-till>
```

Restart Django after changing configuration. The till number is snapshotted on each payment quote so changes do not silently redirect an existing quote. No API consumer keys, passkey, payment webhook or payment worker are required for manual collection. Existing Paystack code/records remain, but hosted checkout and webhook ingestion are disabled while the active provider is manual M-Pesa.

When migrating payment settings, use the approved deposit timing `handover`. Category amounts still need approval; do not substitute zero or enable online deposit collection. The legacy `/dashboard/payment-settings` is not yet migrated to Convex. The other KYC policies and verified phone checks still apply.

## Customer flow

1. Complete booking-specific KYC approval.
2. Open the booking under `/account` and review the amount.
3. Use M-Pesa → Lipa na M-Pesa → Buy Goods and Services with the displayed till, check the expected recipient name in M-Pesa and send the exact amount. The expected recipient name has not been supplied to the app; contact Movara if unsure.
4. Submit the ten-character M-Pesa code and confirm the displayed amount/recipient.
5. Wait for finance verification, then refresh payment status. A code submission is a claim, not proof of payment. Do not pay twice.

An expired quote must not be used to send new funds. An already-paid customer can still submit the code from their existing quote for reconciliation, including after hold expiry. Holds retain `PAYMENT_HOLD_MINUTES` (30 by default); submitting a code does not extend them. Finance must verify before expiry for automatic confirmation.

## Finance flow

Use a finance-role account or an owner/admin account and open `/dashboard/payments`.

Check the exact transaction code in the merchant till's M-Pesa account/statement. Verify recipient, amount actually received and payment timestamp; do not rely on a customer screenshot or SMS forwarded by the customer. Enter the amount in KES, the actual Nairobi payment time and your verification findings. Tick the receiving-account check and record the verified receipt. If no receipt exists, record a reason and reject the claim. A rejected code does not prove no money was sent; customers should contact finance before retrying.

Exact receipts confirm only if the booking hold remains unchanged/unexpired, KYC/customer details remain valid, the vehicle remains available and the booking is unpaid and at the payment stage. A globally unique `MPESA-<code>` receipt prevents one transaction funding multiple bookings. Customer claims are not globally unique, so an unverified claim cannot monopolise someone else's real receipt code.

Late receipts, incorrect amounts and changed eligibility create immutable receipts in finance review without reserving the car. Follow up with the customer and record finance notes. Refunds, balances and alternative bookings require manual handling while the business policies are pending; this module does not issue refunds or override holds. Actual Safaricom fees are not returned by an API in this flow and are stored as unknown, rather than invented.

Quotes, claims, receipt events, allocations and finance notes are append-only, with PostgreSQL triggers backing application guards. A verified receipt cannot be edited or rejected afterwards. Follow-up notes preserve corrections and reconciliation findings.

## Future automation

Direct Daraja STK Push requires an enabled merchant Paybill or Buy Goods Till, consumer key/secret, shortcode, passkey and public callback URL. A dedicated ordinary phone number alone cannot receive direct Daraja STK collections. Paystack can be reconsidered after account approval; changing the active provider requires corresponding checkout UI and fee-policy review.
