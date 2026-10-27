# Movara Car Hire

Convex migration has started: Convex Auth is deployed to the linked development project, with new `/sign-in` and `/workspace` routes. Customer booking requests and the admin request queue now use Convex; catalogue, KYC, payments and remaining operational tools still need migration. See [Convex migration setup](frontend/convex/README.md) for private owner onboarding and remaining work.

Movara uses Next.js and TypeScript for the website and dashboards, Django REST Framework for the backend, PostgreSQL for records, and Cloudinary for public vehicle photos.

## Start locally

Backend:

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 127.0.0.1:8001
```

Frontend:

```bash
cd frontend
npm ci
npm run dev
```

`frontend/.env` or `.env.local` must contain:

```dotenv
NEXT_PUBLIC_API_URL=http://127.0.0.1:8001/api/v1
```

For a fresh installation, create a Python virtual environment, copy `backend/.env.example` to `backend/.env`, configure PostgreSQL, generate the encryption key, run migrations, then create an owner with `python manage.py createsuperuser`.

## Where to work

| Page | Purpose |
| --- | --- |
| `/admin-login` | Staff email, password and authenticator login |
| `/dashboard` | Role-specific operations dashboard |
| `/dashboard/cars` | Vehicle records, registration, mileage and Cloudinary photos |
| `/dashboard/fleet` | Insurance and inspection records; service and repair date blocks |
| `/dashboard/bookings` | Booking history and front-desk-assisted drafts |
| `/dashboard/kyc` | Document review, corrections, rejection and conditional approval |
| `/dashboard/team` | Owner assignment of staff roles |
| `/dashboard/audit` | Owner view of append-only audit events |
| `/dashboard/policies` | Approved eligibility, staffed hours, category and privacy settings |
| `/account` | Customer account, WhatsApp verification, profile, bookings and documents |
| `/cars` | Live public Django catalogue |
| `/privacy` | Published approved privacy notice |

A vehicle needs a registration number and current insurance/inspection records to appear publicly. Booking dates must be covered by those records and must avoid service periods and blocking bookings. Rental intervals use an exclusive end date, so a return date can be the next rental's pickup date.

## Staff authentication and roles

First staff login returns an authenticator setup key after a valid email/password. Add the key to an authenticator app and enter its six-digit code. Subsequent logins require a fresh code. Django administration also requires an enrolled authenticator. Generic customer login cannot issue staff tokens.

Owner access uses the existing admin role or Django superuser flag. Staff roles use Django groups: `fleet_manager`, `kyc_reviewer`, `front_desk`, `finance`, `admin`. An owner can grant roles to an existing account by email. API permissions enforce these roles independently of navigation visibility.

Lost authenticator recovery requires trusted server access and a recorded reason:

```bash
python manage.py reset_staff_mfa staff@example.com --reason "Owner-approved device replacement"
```

JWT access tokens expire after 30 minutes. Users sign in again when needed. Logout removes the browser token; it does not revoke an already issued access token.

## Storage and configuration

Keep credentials in `backend/.env` or the backend process environment. Existing process variables take precedence. Never put server credentials in `NEXT_PUBLIC_*` variables.

- PostgreSQL uses `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` with `USE_POSTGRES=True`.
- `DATA_ENCRYPTION_KEY` encrypts profiles, document files, phone numbers, email addresses and staff authenticator secrets. Generate it once using `Fernet.generate_key()` and back it up securely. Losing it prevents reading data and logging in. Rotation needs a data migration; replacing the value directly is not supported.
- Email encryption is deterministic to support unique login lookups; equality between encrypted email values remains visible. Phone and document encryption is randomized.
- Cloudinary uses `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. Only public catalogue photos use Cloudinary URLs.
- IDs and licences are encrypted under `backend/private_documents/`, outside public media. Uploads accept JPEG, PNG or WebP up to 5MB, reject unreadable/undersized/blank images and apply a basic blur heuristic. Reviewers still check cropping, legibility and authenticity manually.
- Private document links expire after 60 seconds. Owners and authorised reviewers can request them, access is audited, and delivery responses prohibit caching. A signed link can be used by anyone holding it until it expires; treat it as confidential.
- Existing public local photos under `backend/media/` continue to work.

The previous SQLite records were copied to the configured PostgreSQL database. SQLite remains a local backup/development option with `USE_POSTGRES=False`; database exclusion and immutable-history triggers require PostgreSQL. No customer policy values were filled from guesses.

## WhatsApp phone verification

Regular WhatsApp is the default: `OTP_BACKEND=manual_whatsapp`. No Meta API account, credentials or paid messaging service is required for this flow. The public floating contact control links to WhatsApp, calls and SMS on **0716 741 039** (`+254716741039`). The links open the user's own app; the website does not send messages itself.

Customers enter their WhatsApp number under `/account`, generate a reference, and send it to Movara using the provided link. References are random, hashed at rest, expire after 30 minutes, are single use, and are invalidated when a new request is issued. Customers cannot verify their own reference through the OTP endpoint. A reviewer or owner opens `/dashboard/phone-verification`, checks the actual WhatsApp sender's full number against the requested number, enters the reference received in WhatsApp, and confirms the sender check. Five incorrect references consume the request. Verification is audited. Clicking the WhatsApp link alone never verifies a number.

Before launch, perform a real-phone acceptance test: generate a reference from an actual customer account, send it from that same number, have an authorised reviewer verify it, and refresh account status. Also try a mismatched sender and an expired reference. No real WhatsApp exchange has been performed by the development tests.

The existing Meta Cloud API adapter is retained as an optional future integration (`OTP_BACKEND=whatsapp`). It needs server-side credentials, a supported API version and an approved authentication template. It is not required for the manual flow. Development OTP is restricted to `OTP_BACKEND=development` with `DEBUG=True`.

## Policies and workflow jobs

Section 16 decisions remain pending. Owner policy settings start empty. Do not enter unapproved values.

Document submission needs an approved privacy notice/version and retention period. Confirmed driver eligibility is age 22+ with a licence held for 24 months. Every vehicle requires guarantor and next-of-kin contacts/details. The KYC review target is 30 minutes before handover; optional staffed hours refine scheduling. Category JSON uses the exact category name with a boolean `guarantor_required`; optional `minimum_age` and `minimum_licence_months` override general eligibility. Cross-border travel is excluded for now. Contracts are signed manually before handover. Additional drivers and chauffeur hire are available where applicable, subject to staff confirmation. Prices use flat daily or agreed market rates; weekend/seasonal pricing is not introduced. Remaining policies await client details.

The KYC timer counts staffed minutes in Africa/Nairobi, preserving its deadline through corrections. The review records manual NTSA verification; no automated government lookup or face matching is implemented. Approved customers can reuse unchanged valid documents for a new draft, with another booking-specific review.

Run this job every minute using your process scheduler:

```bash
python manage.py process_workflow
```

For local development, `python manage.py process_workflow --watch` keeps the worker running every 60 seconds.

It expires unpaid holds and produces 15-/25-minute staff inbox alerts and missed-review records. Availability requests also expire stale holds. Holds use `PAYMENT_HOLD_MINUTES` (30 by default). Manual verification must finish before the hold ends; submitting a code does not extend it. KYC outcome notifications currently appear in customer inboxes; proactive WhatsApp status notifications need separately approved templates.

New payments use **manual M-Pesa Buy Goods Till** (October 26, 2026), pending configuration of the client-supplied `MPESA_TILL_NUMBER`. Customers review the server-calculated amount, pay the displayed till, and submit their M-Pesa transaction code. STK Push remains pending merchant credentials and integration. Finance checks the code, recipient, amount and timestamp in the receiving account at `/dashboard/payments`. Only a verified receipt that passes KYC, availability and hold checks confirms the booking. The application adds no processing surcharge; Safaricom transfer charges are separate.

Configure `PAYMENT_PROVIDER=manual_mpesa` and the client-supplied `MPESA_TILL_NUMBER` in `backend/.env`. No Daraja or Paystack credentials are needed for this manual flow. Paystack checkout and its webhook are inactive. Existing Paystack records remain preserved. Manual transactions do not use the Paystack reconciliation worker. Run the workflow worker to expire holds normally.

An owner must record the approved security-deposit decision at `/dashboard/payment-settings` before customers can obtain payment instructions. Pending policies remain blocked. Late payments, amount mismatches and changed KYC/availability retain their verified receipts for finance review, without automatically confirming a booking or issuing a refund. See [payment operations](docs/PAYMENTS.md).

Physical release remains disabled until the handover module is implemented. PostgreSQL prevents overlapping reservations and protects payment ledger/history records against updates and deletion.

The approved document retention period is seven days. See [privacy operations](docs/PRIVACY.md) for scheduled cleanup, customer access/correction/deletion requests, holds and preserved records. Document upload is gated by the approved notice and retention period. Private-file hosting must remain outside publicly served directories. Production additionally needs HTTPS, a shared rate-limit cache, database/backups, and a scheduled workflow worker.

## Verification

```bash
cd backend
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test apps.accounts apps.core apps.rentals apps.workflow apps.payments
```

The database user running tests needs permission to create a separate test database. PostgreSQL integration tests cover direct-write overlap protection and immutable audit records; they are skipped under SQLite.

```bash
cd frontend
npm run typecheck
npm run lint
npm run build
```

The specification is in `docs/Movara Car Hire Car Hire System Specification v1.1.md`.

## Convex vehicle management

The Convex admin pages `/dashboard/cars` and `/dashboard/fleet` manage vehicles,
whole-KES daily rates, photos, publication, mileage, insurance/inspection expiry
and dated maintenance blocks. Owner/admin/fleet-manager permissions are enforced
in backend functions. Archive preserves existing booking requests; restoration
creates a hidden draft. Registration numbers and maintenance reasons are staff-only.
Photos are public catalogue assets; identity documents must never use this upload.
Unused photo uploads are deleted after 24 hours; replaced photos are deleted after saving.

The public catalogue and vehicle detail pages read Convex. Publishing requires
current compliance dates. Customer requests select a published vehicle, check
compliance coverage and maintenance overlap for the requested dates, and snapshot
the daily rate and rental estimate. Return/block-end dates are exclusive. Requests
do not create reservations, request payment, or replace KYC/contract checks.
No sample fleet is published automatically: enter the client's actual vehicles,
rates and compliance dates before publishing. Payments, document review, staff
management and privacy workflows still need migration from Django to Convex.

Run `npm run test:vehicles` alongside `npm run test:auth` in `frontend`.


## Client policy update — 27 October 2026

Deposits are collected at handover; category amounts and deposit return details
remain pending. Failed physical checks refund the full amount paid less transaction
costs, under the manually signed contract. No-show release is immediate after a
missed agreed pickup time (no two-hour grace period). Cancellation and insurance
terms remain in the contract; their actual text is needed before calculations.
Owners provide GPS trackers; supplier/subscription details and tested tamper alerts
remain pending. See the latest update in the system specification for all decisions.
Shared policy copy is in `frontend/src/config/rental-policy.ts` and is displayed
in the customer workspace, FAQs and admin overview. These are recorded decisions;
Convex handover, no-show, payment/refund and tracker automation remain to be built.

Payment sequence clarification (27 October 2026): collect rental payment and any
security deposit only after all checks, physical clearance and manual contract
signing are complete. Verify payment before vehicle release. Earlier Django
payment-after-online-KYC instructions are superseded and require migration.

Admin vehicle entry: open **Dashboard → Add cars, photos & rates → Add car & photo**.
The numbered form includes vehicle details, compliance, a cover photo and publication.
Choose a JPEG/PNG/WebP from the device gallery/Documents or drag and drop it (5MB
maximum input); gallery frames use 4:3. Switch between Photo gallery and Table
for reviewing records. This picker uploads photos, not PDF/Excel vehicle imports.

## Single-admin verification and return records — 27 October 2026

Only `movaracarhire@gmail.com` with its existing active owner membership can
perform Convex admin actions. The unlisted, noindex admin sign-in is
`/movara-access` (`/admin-login` redirects there); public `/sign-in` handles
customers and does not link to admin access. A link alone grants no permission.
Staff management and audit/reporting screens are removed from the dashboard.
Internal operational event records remain for integrity and investigation.

Identification currently happens **in person**, as the client confirmed. No
identity-document upload is exposed and no copies are collected by this flow.
Customers open a booking's Identification & contact details section and provide
their full name, next of kin and guarantor contacts with permission to share them.
The owner checks original ID/passport and licence, age 22+, licence tenure 2 years,
customer phone and contacts. Corrections invalidate previous checks; stale review
submissions are rejected. An approved privacy notice and private document handling
must be in place before a future online-upload option is opened.

Under `/dashboard/bookings`, open Verification, approval & return record. Approved
in-person checks and a non-flagged customer allow booking approval, which reserves
the car after a transactional availability/compliance check. Adjacent rentals are
allowed; overlapping approvals are rejected. Customers cannot silently cancel or
change an approved rental. Payment is still not collected by this module: manual
contract signing and verified payment remain prerequisites to actual vehicle release.

For rentals actually handed over under a manually managed contract, record good
condition, damage/issues, or non-return; whether rules were followed; and clear,
flagged or second-chance disposition with findings. Contract terms govern charges,
fuel/mileage and deposit settlement; this is a conduct record, not a financial
settlement. Non-return keeps the car unavailable for future dates until recovery
is recorded. A flag blocks approval; an explicit second chance allows a fresh
review without deleting history. A later good return never silently clears a flag.

Run `npm run test:rentals` with the frontend auth and vehicle checks.

## Session security — 27 October 2026

Both admin and customer sessions warn after 30 minutes without interaction and
expire after 31 minutes. The warning offers Stay signed in / Sign out. Expiry is
checked by protected Convex queries/mutations as well as the browser. Page polling,
focus and background updates do not renew activity; reopening an expired tab
cannot renew the expired session. Activity is batched at 15-second intervals.

Five unsuccessful password attempts trigger a 15-minute account lock across
browsers and both portals. Registration is covered too because Convex Auth can
match an existing password account through its signup flow. Attempt slots are
reserved transactionally to prevent concurrent requests exceeding five in flight.
A correct attempt resets the failure streak; expired abandoned attempts free slots.

Credential guards reject stale credentials on every protected request. The
CLI-only password-maintenance mutation changes the stored hash and revokes old
sessions/refresh tokens atomically. Other credential changes immediately deny old
sessions access, and the next authenticated login deletes the older sessions.
The maintenance script reads a password from stdin; passwords are not stored in
source. Existing pre-rollout sessions must sign in again to initialize the guard.

Run `npm run test:security`, `npm run test:auth` and `npm run test:workflow` from
`frontend`. As with the other pending changes, these protections require a
successful Convex sync; local verification does not mean the deployment is live.

To reset the existing admin password without remembering the old one, run
`npm run admin:password` from `frontend`. This syncs the configured development
backend, prompts twice for the new password without echoing it, changes the
password hash, revokes existing sessions and verifies admin sign-in. It does not
create a duplicate account or place the password in source files. A working
Convex connection and authenticated CLI are required. The admin account remains
`movaracarhire@gmail.com`; sign in at `/movara-access`.

If Convex fails while authorizing with `TypeError: fetch failed`, the password
reset has not reached its write step. Use `npm run convex:dev` rather than plain
`npx convex dev` to include the project's shared Node network settings. The
password-reset and auth-maintenance commands use the same preload in child CLIs.
`MOVARA_IPV4_ONLY=true npm run convex:dev` is an optional IPv4-only diagnostic;
it does not fix an unreachable or intermittent internet connection.

Compare `curl.exe -I --connect-timeout 10 https://api.convex.dev` in Windows
PowerShell and `curl -4 -I --connect-timeout 10 https://api.convex.dev` in WSL.
If both fail, test another internet connection and review any VPN/proxy setup.
If Windows works consistently but WSL fails, save WSL work, run `wsl --shutdown`
in PowerShell, reopen Ubuntu and retry. Shutting down WSL stops its running apps.
Do not disable TLS verification or paste Convex tokens into chat for this error.

Password reset helper correction (27 October 2026): hashing and authorize wrapping
now resolve the Password provider's options layer. Regression checks run under
`npm run test:auth`. The corrected development backend has been synced and the
owner's requested password reset/sign-in verified; all previous/test sessions
were revoked. No password is recorded in this repository.

Auth navigation recovery: sign-in, customer workspace and dashboard now share the
same `(convex)` layout/provider. The dashboard source moved from `(admin)` into
that route group without changing its `/dashboard` URL. A fresh storage namespace
ignores stale browser refresh flags from earlier sessions. Missing-refresh-cookie
requests clear the stale auth cookies and return a signed-out result, with the
SDK's same-origin rules preserved. Connection failures show retry screens instead
of exposing a raw runtime error; account reads retry once without retrying writes.
Restart the development server after the route/environment changes. IPv4-only
routing is enabled in this host's ignored `.env.local`; deployment defaults remain
unchanged. HTTP checks verified stale-cookie recovery, CORS rejection, owner login,
both auth cookies and the dashboard response. Only the test session was signed out.

Remaining development work and pending client details are tracked in [docs/REMAINING_TASKS.md](docs/REMAINING_TASKS.md), outside the application UI.
