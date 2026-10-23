# Movara implementation: steps 1–5

Specification: `Movara Car Hire Car Hire System Specification v1.1.md`.

## Implemented

1. PostgreSQL configuration and migration of the previous local records; encrypted email/phone fields and private profiles; six staff roles; authenticator enrollment/login; role permissions; immutable audit records and MFA recovery command.
2. Vehicle registration/mileage, Cloudinary catalogue images, insurance/inspection validity records and maintenance date blocks. Public pages use Django records. Required documents must cover the selected rental period.
3. Customer and front-desk draft creation, date-based availability, PostgreSQL exclusion constraint, complete status vocabulary and append-only history, approval-time holds and expiration. Payment confirmation is available through the verified receipt module; handover remains pending.
4. Customer account/profile, WhatsApp verification adapter, hashed expiring single-use codes, encrypted private ID/licence uploads and short-lived delivery links, basic image-quality checks, booking-specific KYC cases, reviewer checks/decisions/corrections, duplicate/blocklist checks, staffed-time review targets, inbox notifications, and reuse of unchanged approved documents.

5. Manual M-Pesa quotes/instructions, customer transaction-code submission, finance verification/rejection and notes, immutable receipts, duplicate-code protection, and confirmation gated by KYC, vehicle availability and an unexpired hold.

## Review routes

- Staff: `/admin-login`, then the role-specific `/dashboard` links.
- Fleet: add a registered vehicle at `/dashboard/cars`; add valid insurance and inspection records at `/dashboard/fleet`.
- Customer: `/account`, choose dates, create a draft, verify phone, complete profile, upload the four document images and submit with consent.
- Reviewer: `/dashboard/kyc`, start a case and record its checks and decision.
- Finance: `/dashboard/payments`.
- Owner: `/dashboard/team`, `/dashboard/audit`, `/dashboard/policies`, `/dashboard/payment-settings`.

The first staff login requires adding a setup key to an authenticator app. Existing accounts and password hashes were preserved when moving to PostgreSQL.

## Pending external inputs and operations

- Section 16 decisions remain unfilled. Privacy notice/retention approval gates submission. Driver eligibility, staffed hours and category guarantor rules gate KYC approval. Cross-border requests remain blocked.
- WhatsApp live delivery needs the provider selection confirmed, server credentials and an approved authentication template. The current adapter targets Meta directly. It has been tested with mocks, not a live message.
- Run `python manage.py process_workflow` every minute to expire holds and generate staffed-hours review alerts. A process scheduler must run this in deployed environments; `--watch` is available locally.
- Payment decision (October 23, 2026): use manual M-Pesa Send Money while Paystack is under review and no Daraja merchant shortcode is available. Customers submit transaction codes; finance verifies the receiving account before recording receipts and confirming eligible bookings. No application surcharge is added. Paystack checkout is inactive. Deposit terms still require owner approval. Contract/handover gates, returns and tracking remain outside this change. See `PAYMENTS.md`.
- Before live collection: implement retention erasure and privacy-request operations against the approved retention policy; configure HTTPS, backups, encrypted-key backup, a shared rate-limit cache and private-file deployment storage.

## Verification

The backend suite runs against PostgreSQL, including direct database overlap and audit-tampering tests. SQLite remains available for development but cannot enforce the PostgreSQL-specific guards. Frontend type checking, lint and the production build are part of validation.

The main README contains environment variables, startup commands and role/MFA recovery instructions.
