# Production readiness status — 6 November 2026

The application code has been hardened and prepared for owner acceptance testing.
Public launch still requires the browser/operational checks in PRODUCTION_TESTING.md.
No claim of a penetration test or completed user acceptance testing is made.

Resolved from the earlier review:

- Patched Next.js, Auth.js, Convex and Gmail SMTP dependencies; all-package and
  production-only audits report zero findings.
- Fixed the lint gate and added CI for type checking, lint, tests, dependency audit
  and a production build. Added safe response headers and an explicit build root.
- Replaced the failing legacy privacy API page with accurate current service text.
  The built /privacy route returns 200; obsolete REST-dependent admin routes now
  redirect to the working dashboard instead of presenting broken workflows.
- Added Accept/Decline cookie preferences, six-month persistence and a settings
  control. Essential auth cookies remain available for Google/password login;
  optional consent is denied by default. No analytics/ad tracker is installed.
- Added authenticated customer data export, privacy requests, owner review and
  controlled eligible-account erasure. Rental/financial history requires retention
  review and cannot be erased through the quick action.
- Added owner-only verified receipt, signed-contract clearance, release, refund
  and deposit-settlement records. Public payments stay closed because the till is
  not ready. No money movement is performed by these recording actions.
- Booking detail links now open the requested record. Customer Ready for handover
  status is based on recorded verification rather than an assumed future stage.
- Added safe CLI production admin setup/password maintenance. Initial owner
  bootstrap is internal-only and refuses to overwrite any existing designated account.

Verification: type checking, full lint and all automated suites pass. The production
build passes on Next 16.4.5. Local built-app HTTP checks verified homepage/sign-in/
privacy 200 responses, correct anonymous workspace/admin redirects and security
headers. Cookie parser/default-deny and financial/privacy handler rules are covered
by automated tests; handler tests do not emulate Convex transaction isolation.

Deployment: backend changes are deployed to flexible-mammoth-262. The frontend
must be pushed/redeployed on Vercel before the changes are live. Production vehicle
inventory was empty; add actual cars or separately review an inventory migration.

Still operational/manual: real Google and reset email round trips, browser cookie
interaction, real owner/customer journeys, merchant setup, contract terms, backup/
restore confirmation and immediate staff handling of no-shows. Online identity
uploads and tracker integrations remain closed/out of scope. Refer to the detailed
testing guide; do not treat a clean build as completed launch approval.
