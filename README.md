# Movara Car Hire

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

The live adapter uses Meta WhatsApp Cloud API authentication templates with a copy-code button. Configure:

```dotenv
OTP_BACKEND=whatsapp
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_OTP_TEMPLATE=
WHATSAPP_API_VERSION=
WHATSAPP_TEMPLATE_LANGUAGE=en
```

The template must already be approved. Set an API version supported by your Meta application. Codes expire after five minutes, are stored as hashes, and cannot be reused. Requests and attempts are rate-limited. Missing credentials produce an unavailable message, without marking a phone verified.

For local testing only, `OTP_BACKEND=development` together with `DEBUG=True` returns a development code to the authenticated customer. No message is sent. With `DEBUG=False`, codes are never returned. Live WhatsApp delivery remains unverified until credentials and the approved template are supplied.

## Policies and workflow jobs

Section 16 decisions remain pending. Owner policy settings start empty. Do not enter unapproved values.

Document submission needs an approved privacy notice/version and retention period. KYC approval also requires driver eligibility rules, staffed hours and an explicit guarantor decision for the selected vehicle category. Category JSON uses the exact category name with a boolean `guarantor_required`; optional `minimum_age` and `minimum_licence_months` override general eligibility. Cross-border approval remains blocked pending the travel policy.

The KYC timer counts staffed minutes in Africa/Nairobi, preserving its deadline through corrections. The review records manual NTSA verification; no automated government lookup or face matching is implemented. Approved customers can reuse unchanged valid documents for a new draft, with another booking-specific review.

Run this job every minute using your process scheduler:

```bash
python manage.py process_workflow
```

For local development, `python manage.py process_workflow --watch` keeps the worker running every 60 seconds.

It expires unpaid holds and produces 15-/25-minute staff inbox alerts and missed-review records. Availability requests also expire stale holds. Holds use `PAYMENT_HOLD_MINUTES` (30 by default). Manual verification must finish before the hold ends; submitting a code does not extend it. KYC outcome notifications currently appear in customer inboxes; proactive WhatsApp status notifications need separately approved templates.

The active payment method is **manual M-Pesa Send Money** (October 23, 2026). Customers review the server-calculated amount, send money to the dedicated receiving phone, and submit their M-Pesa transaction code. Finance checks the code, recipient, amount and timestamp in the receiving account at `/dashboard/payments`. Only a verified receipt that passes KYC, availability and hold checks confirms the booking. The application adds no processing surcharge; Safaricom transfer charges are separate.

Configure `PAYMENT_PROVIDER=manual_mpesa` and `MPESA_RECEIVING_PHONE=+254716741039` in `backend/.env`. No Daraja or Paystack credentials are needed for this manual flow. Paystack checkout and its webhook are inactive. Existing Paystack records remain preserved. Manual transactions do not use the Paystack reconciliation worker. Run the workflow worker to expire holds normally.

An owner must record the approved security-deposit decision at `/dashboard/payment-settings` before customers can obtain payment instructions. Pending policies remain blocked. Late payments, amount mismatches and changed KYC/availability retain their verified receipts for finance review, without automatically confirming a booking or issuing a refund. See [payment operations](docs/PAYMENTS.md).

Physical release remains disabled until the handover module is implemented. PostgreSQL prevents overlapping reservations and protects payment ledger/history records against updates and deletion.

Retention settings currently gate collection and record the approved period. Automated retention deletion and access/correction/deletion request handling still need a dedicated implementation before live personal-data collection. Private-file hosting must remain outside publicly served directories. Production additionally needs HTTPS, a shared rate-limit cache, database/backups, and a scheduled workflow worker.

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
