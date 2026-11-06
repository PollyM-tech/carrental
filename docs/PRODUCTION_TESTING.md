# Production acceptance testing

The code is prepared for owner acceptance testing. Passing automated checks is
not a substitute for the browser and operational checks below.

## Deploy the frontend

Commit/push the frontend and lockfile changes and redeploy the existing Vercel
project. Production variables must point to flexible-mammoth-262. The backend
privacy, handover and security changes have been deployed separately to that
production Convex deployment. No Vercel deployment was triggered from this
workspace because a Vercel connection is unavailable.

Use Node 24 for local/CI checks: `cd frontend && npm ci && npm run check && npm run build`.
The build deliberately uses webpack. npm audit should report zero findings for
both all packages and `--omit=dev`. The Nodemailer override selects the patched
SMTP implementation used by our own Gmail transport; Auth.js's optional built-in
Nodemailer provider is not used. Regression tests cover the custom sender.

## Sign-in and cookies

1. In a fresh/private browser, verify the cookie banner offers Accept and Decline.
   Choose Decline: the banner closes and optional consent remains declined after
   refresh. Google/email login must still work because login cookies are essential.
   Reopen Cookie settings and change the choice to Accept. No analytics or ad
   integration is currently installed; accepting does not add a tracker.
2. Test a separate customer Google account and verify redirect to /workspace.
   The designated admin Google account is deliberately rejected from customer OAuth.
3. Test email/password registration, sign-out, sign-in and forgot-password email
   receipt. Use the code, set a new password and confirm the old one fails. Test
   invalid, expired and reused codes without changing a real customer's password.
4. Test five failed logins on a dedicated test account and the 15-minute lock.
   Verify the inactivity warning after 30 minutes and logout one minute later.
5. Sign in as movaracarhire@gmail.com on /movara-access. Production preserves the
   existing designated admin login; sessions were not migrated. Rotate the admin
   password previously shared in chat before public launch. For private CLI
   maintenance run `npm run admin:password:prod` and enter the password when prompted.
   Do not paste credentials into chat or source control.

## Fleet and booking

1. Production started with no vehicle records. Add actual vehicles/photos in its
   admin; no development customer/test bookings were migrated. Use up to 12 photos,
   choose a cover and check listing/modal/detail galleries on phone and desktop.
2. Leave optional category/specs/rate blank and verify unknown specs are hidden.
   A car needs current insurance/inspection and publication before it is public.
3. Change availability to maintenance/booked: the car must disappear from the
   website and move to the Archive management view. Mark Available to restore it
   if there is no outstanding approved rental.
4. Submit a customer request, verify details in admin, complete in-person checks
   and paper signing, approve, then verify the public car disappears. Test a
   conflicting request and cancellation before handover. Deep booking links now
   open the actual record.

## Payments, handover, refunds and return

The till is not ready. Public payment instructions and STK collection remain
closed. Do not send money to a contact number based on this app. Staff record
only receiving details and transactions actually checked in the receiving account.
All transfers/refunds are performed outside the app; these forms record verified
outcomes and do not move money.

Use development/test accounts for synthetic financial records. For genuine
production operations, record only actual verified receipts:

1. On an approved booking, enter the agreed rental/deposit, actual received total,
   receiving account/recipient, M-Pesa code and Kenya payment time. Confirm the
   signed contract, physical clearance and account check. Amounts must reconcile;
   duplicate M-Pesa codes cannot be used on another booking.
2. Customer progress should show Ready for handover only after verification.
   Record vehicle release within the agreed rental dates. Release must fail
   without the receipt, with a customer flag, invalid compliance or maintenance.
3. Before release, verify an actual refund and documented transaction costs, then
   record it. A refunded booking cannot be released or reapproved; create a new
   request if the customer later wishes to hire again. Cancel approval only after
   financial issues are resolved.
4. Record a return/non-return and conduct outcome. After a returned car, record
   actual deposit settlement; the returned sum plus contract deductions must equal
   the collected deposit. Keep contract evidence outside public vehicle photos.
5. No-show release remains a staff operation under the agreed pickup time in the
   paper contract. Automatic timed release is not enabled without a system pickup
   timestamp/arrival check. Staff must handle it immediately under the approved policy.

## Privacy

Open /privacy: it must return 200 and describe actual current operations, not the
old REST service. In the customer dashboard, download information and submit an
access/correction/deletion request. Other customers must not see it. In admin,
review and respond through Data requests. Eligible accounts with only pending/
cancelled requests can be deleted, revoking sessions and removing their records.
Actual rental/payment history and disputes are held for retention review; explain
that hold instead of pretending deletion completed. The owner cannot delete their
own protected admin account through customer privacy requests.

Identity-document uploads remain closed. No seven-day identity-file purge is
claimed active. Supplier tracker integrations remain outside the current app.

## Operational checks before public launch

Confirm actual business contracts/deposit amounts/insurance and refund terms,
record the merchant till when ready, complete browser tests and rotate shared
credentials. In Convex/Vercel, verify access to logs, backups/exports and a tested
restore plan before relying on real rental records. Do not overwrite production
with an unreviewed development export.

## Booking and WhatsApp handoff

Submit a customer booking and a public contact enquiry. Confirm each appears in the admin bookings page before tapping Send in WhatsApp. Both links must address 0716 741 039 and include the saved reference and supplied request details. Returning without sending must preserve the backend record; retrying the same submission must not create duplicates. Check the saved-request fallback link and failure feedback with the network disconnected. WhatsApp messages require the customer to tap Send; opening WhatsApp does not confirm message delivery.
