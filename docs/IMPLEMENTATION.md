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
- Regular WhatsApp manual verification is implemented; Meta API integration is optional. A real customer/staff phone acceptance test remains. Contact number: 0716 741 039.
- Run `python manage.py process_workflow` every minute to expire holds and generate staffed-hours review alerts. A process scheduler must run this in deployed environments; `--watch` is available locally.
- Payment decision (October 26, 2026): new payments use Buy Goods Till, pending the client-supplied till number. STK Push is requested and awaits merchant configuration and integration. Existing phone-transfer quotes retain their original recipient. Customers submit transaction codes; finance verifies the receiving account before recording receipts and confirming eligible bookings. No application surcharge is added. Paystack checkout is inactive. Deposit terms still require owner approval. Contract/handover gates, returns and tracking remain outside this change. See `PAYMENTS.md`.
- Seven-day operational document/KYC retention cleanup and customer access/correction/deletion requests are implemented; see `PRIVACY.md`. Before launch, approve the privacy notice, test production storage deletion/backup expiry, and configure HTTPS, backups, encrypted-key backup, a shared rate-limit cache and private-file deployment storage.

## Verification

The backend suite runs against PostgreSQL, including direct database overlap and audit-tampering tests. SQLite remains available for development but cannot enforce the PostgreSQL-specific guards. Frontend type checking, lint and the production build are part of validation.

The main README contains environment variables, startup commands and role/MFA recovery instructions.

## 27 October 2026: single-admin and in-person workflow

Source now includes the unlisted `/movara-access` login for the existing owner,
public customer login, in-person original-document/phone/eligibility checks,
kin/guarantor contact collection, booking approval with overlap/compliance checks,
and customer return/conduct records with flag/second-chance decisions. Staff and
audit/reporting screens are removed. Online identity uploads stay closed by client
choice. Payment collection/release remains a separate pending module.

Local auth, rental-rule and actual-handler integration checks pass; the integration
adapter is in-memory and does not claim to emulate Convex transaction isolation.
The production build and type checks pass. Lint has the two pre-existing warnings.

Live verification is incomplete: the development deployment initially accepted
new tables/functions, then Convex HTTP/CLI calls began timing out. The final source
adds phone-check enforcement and review revision checks after that initial push.
**A successful final sync is required before using the new workflow.** From
`frontend`, run `npx convex dev --once` when connectivity is restored, and perform
real owner/customer sign-in plus verification/approval/return smoke checks.

Temporary internal `workflowSmoke` helpers were removed from source and local
generated types. Their removal from the deployment and cleanup of any synthetic
login-test accounts could not yet be verified due to the connection failure.
Synthetic accounts use only `movara-smoke-<hex>@example.invalid`; never delete a
real customer's records during cleanup. No real identity files or payments were
used. The temporary helper backup and cleanup retry scripts are under `/tmp` in
this working session; clean synthetic records before the final sync removes the
old deployed helpers. Never share or reset the real owner's password for tests.

Session-security source update: both portals warn at 30 idle minutes and expire
at 31; protected operations validate the session, credentials and activity on the
backend. Login failures use a shared account key, five-attempt limit and a
15-minute lock; signup and concurrent attempts are covered. Password maintenance
now uses `security:resetOwnerPassword` to update the hash and revoke sessions in
one transaction. Normal credential changes are also detected by protected APIs.
Local security/handler tests, typecheck, lint (existing warnings) and production
build passed. Live sync remains blocked by the Convex connection timeout; do not
claim these controls are active until the final sync and live tests pass.

Password-provider fix and live recovery (27 October 2026): Convex sync succeeded.
The Password factory stores its implementation under `options`; the shared
credentials helper resolves that layer before hashing or wrapping authorize.
Provider tests now exercise actual hashing/verification and the original authorize
implementation. The corrected backend was deployed to the configured development
project. The requested owner password was reset successfully, owner sign-in was
verified, and previous/verification sessions were revoked. No password or token is
stored in these notes. Earlier network-blocked sync/reset status is superseded;
the broader live workflow checks and any historical synthetic-account cleanup
remain separate, unverified items.

Customer dashboard now leads with active bookings, progress and next steps, followed
by the pickup checklist, another-request form, rental terms, past bookings and
contact details. Booking cards include owner-scoped vehicle photos and rental
estimates. Readiness for handover remains awaiting confirmation: the current
Convex model does not record payment clearance/release or an agreed final quote.
Pending customers can cancel after confirmation or open a WhatsApp change request
with their booking reference; approved changes go through Movara. Floating
WhatsApp and call links use the configured business contact. No document-upload
or payment collection was enabled by this UI change.

Optional customer Google OAuth and forgot-password forms are implemented. Google
requires a verified email and rejects the designated owner email; owner access
remains on the private password page. Google-only accounts use the existing idle
session guard, and adding/changing a password invalidates prior sessions. Reset
codes expire after 15 minutes with separate request/code attempt limits. Email
sending is prepared through Resend but configuration is absent. Google client
credentials are also absent, so the Google button is gated off and password
recovery shows support availability. See AUTH_SETUP.md for callback and setup;
real OAuth and email delivery remain unverified until configured. Also corrected
the travel dynamic route params to Next 16's Promise shape after type checking
identified the pre-existing production-build failure.

Google OAuth return routing now preserves the starting frontend origin instead
of resolving every relative redirect against SITE_URL. This prevents losing the
host-scoped verifier when starting on Vercel and returning to the custom domain.
An exact backend origin/path allowlist prevents arbitrary return destinations.
Localhost requires explicit MOVARA_AUTH_LOCAL_ORIGIN configuration. Regression
tests cover same-origin returns, car selection and hostile redirect rejection.
Live Google consent/login still needs browser verification after frontend deploy.

Subsequent user clarification: failure also occurs on the www origin, so the
cross-origin correction is not a confirmed root-cause fix for that attempt.
Redacted live Convex logs show an owner Google-login rejection and later Google
callbacks failing issuer-response validation (`iss` missing). Issuer, token and
PKCE checks remain enabled; do not mark live Google login verified. Added an
OAuth-return failure notice instead of silently displaying the sign-in form.
A fresh customer Google attempt after frontend deploy is needed to diagnose the
remaining callback error; no real Google consent can be completed by local tests.

Gmail SMTP password-reset sending is now implemented through an internal Node
Convex action using TLS on smtp.gmail.com:465 and a fixed business sender. Set
AUTH_GMAIL_APP_PASSWORD in the deployment environment after enabling 2-Step
Verification and creating a Google App Password. Gmail takes precedence over the
existing Resend option when configured. The action validates recipient/code,
disables file/URL content access and SMTP debug logging, sets connection timeouts,
and exposes generic errors. No credentials were entered or stored in source.
Real delivery/reset completion remains unverified until the owner adds the
credential. AUTH_SETUP.md includes the precise activation steps.
