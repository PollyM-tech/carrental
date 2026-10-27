# Convex migration — authentication and booking requests

The development deployment is linked to `https://gregarious-rooster-215.eu-west-1.convex.cloud`; HTTP actions use `https://gregarious-rooster-215.eu-west-1.convex.site`.

Implemented and deployed: Convex Auth email/password provider, auth schema/HTTP routes, signing keys, server-side role helpers, owner provisioning protection and Next.js auth pages. `/sign-in` routes active staff/owners to `/dashboard` and customers to `/workspace`. The dashboard overview and `/dashboard/bookings` use protected Convex queries and Convex sign-out, with no Django requests. `/account` always redirects to the Convex workspace/sign-in flow; signed-in staff continue to `/dashboard`; `/admin-login` redirects to `/sign-in`. The dashboard layout checks membership on the server. Booking requests are active; remaining operational modules stay disabled until their APIs are ported. Convex sessions are never treated as Django staff tokens.

## First owner account

The authorised owner email is **movaracarhire@gmail.com**. Customer signup cannot choose roles or verification flags. Signup for the owner email requires a private setup code, checked on the server. Only that guarded creation path provisions the owner membership; ordinary users have no staff membership.

1. Start Next.js with `npm run dev` from `frontend/`.
2. Open `/sign-in`, choose **Create an account**, enter the owner email and choose a password of 12–128 characters.
3. Open the ignored local `frontend/.env.owner-setup` file privately. Copy only its setup code into the **Private owner setup code** field. Do not share it in chat or commit it.
4. After account creation, `/workspace` should display **owner**. Sign out and sign in again with email/password; the setup code is needed only for initial registration.
5. Close owner registration after confirming access:

```bash
npx convex env remove MOVARA_OWNER_SETUP_SECRET
rm .env.owner-setup
```

Both commands are run from `frontend/`. Do not run `convex:auth:setup` again after closing owner registration unless intentionally reopening the setup flow.

Auth keys and the setup code were configured using `npm run convex:auth:setup`. This command preserves existing signing keys and never prints secrets. Environment values belong in the Convex deployment or ignored local files. The old `ADMIN_PASSWORD` variable is not used by the new auth code.

## Checks

```bash
npm run test:auth
npm run typecheck
npm run lint
npm run build -- --webpack
npm run convex:auth:check
```

The live check uses the authenticated CLI to check anonymous account access, rejection of owner registration with an incorrect setup code, and presence of signing-key configuration. It does not create accounts or replace a browser signup/sign-in test.

## Remaining migration

- Full interactive-browser acceptance with the owner and customer. Live HTTP signup/login/logout, redirects, booking requests and access isolation have passed using synthetic accounts; no real customer or owner password was used by the agent.
- Password recovery and staff MFA before activating sensitive Convex staff workflows. Existing Django MFA is retained on existing tools.
- Catalogue, policies, booking conflict/hold rules, WhatsApp verification, encrypted private documents/KYC, payments/finance checks, data requests and seven-day retention jobs.
- Explicit transfer of current Movara data and reconciliation, followed by frontend API cutover and hosting. The obsolete MoBri users table was empty when inspected. This phase did not delete existing old table data or storage.

Django remains required for the operational app until those modules are migrated; deploying Convex Auth alone does not remove its hosting requirement.

References:
- https://labs.convex.dev/auth/setup
- https://labs.convex.dev/auth/setup/manual
- https://labs.convex.dev/auth/config/passwords

## Local sign-in connection timeouts

The Next.js server registers IPv4-first DNS ordering and a 1000ms address-attempt window in `src/instrumentation.ts`, matching the Convex CLI's networking defaults. Both IPv4 and IPv6 remain available. Restart `npm run dev` after adding or changing this startup file. A `fetch failed` / `ETIMEDOUT` from the auth proxy is a network failure, not a rejected setup code.

Run `npm run convex:network:check` to verify direct Node connectivity and the deployed owner-signup guard. It sends only deliberately invalid test credentials and creates no accounts. `convex:auth:check` separately checks the deployment via the CLI; a CLI check alone does not verify the Next.js-to-Convex network path.

## Customer booking dashboard and international phones

All public account-entry links now use Convex Auth. `/account` no longer renders the old Django registration form. New customers supply email, password and an international phone number and land on `/workspace`; existing customers can sign in without re-entering the phone. Both sign-up and contact updates normalise numbers to `+` plus country code and digits. Spaces, hyphens, dots and parentheses are accepted as formatting; `00` international prefixes and Kenyan `07…`/`01…` local formats are normalised. Validation checks format and 7–15 digits, not number assignment, reachability or ownership. No phone is automatically marked verified.

The customer dashboard supports contact updates and authenticated booking requests: vehicle preference, dates and pickup location. Requests are stored in `movaraBookingRequests`, separate from obsolete MoBri tables. The server derives the customer from authentication, validates dates using Nairobi today, enforces ownership for listing/cancellation and uses a user-scoped request key to avoid duplicate submissions on retry. No identity photos or payment codes are collected here.

Authorised staff can view requests at `/dashboard/bookings`; owners/admins/front desk can mark requests as being reviewed or cancelled. Customers see status updates through Convex subscriptions. These are enquiries awaiting availability, rates, KYC and payment checks; they do not reserve vehicles, allocate payments or confirm rentals. Current catalogue data, document/privacy operations and full rental/payment workflows still need migration before production cutover. The old Django profile/document/privacy implementation does not process these new Convex account records.

Validation included live synthetic customer sign-up through Next.js, international-phone storage, customer/admin route isolation, request creation/retry/cancellation and cross-customer access checks. Temporary accounts, requests, sessions and test events were removed afterwards; the temporary internal cleanup helper was removed from the deployed functions.
