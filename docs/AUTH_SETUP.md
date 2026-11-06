# Customer Google sign-in and password recovery

Email/password remains enabled. Google sign-in is customer-only; the designated
admin email must use the private password portal. Password recovery is visible on
both sign-in pages. No credentials or sender configuration are embedded in code.

## Google setup

1. Create a Google Cloud project and an external OAuth consent screen. Request
   only basic identity (openid, email, profile). Testing mode is limited to listed
   test users; configure publication before general customer use.
2. Create an OAuth client of type Web application. For the currently linked
   development Convex deployment, the exact authorized redirect URI is:
   `https://gregarious-rooster-215.eu-west-1.convex.site/api/auth/callback/google`
3. In the Convex dashboard's environment variables, set `AUTH_GOOGLE_ID` and
   `AUTH_GOOGLE_SECRET`. Never put the secret in NEXT_PUBLIC variables or chat.
4. Set Convex `SITE_URL` to `https://www.movaracarhire.com` (the main frontend origin).
   The Vercel deployment address is `https://carrental-pi-ten.vercel.app`.
   Use the main origin for live customer sign-in.
   Use the production deployment's own callback URL and credentials when deploying
   production. Review Google's consent-screen/domain requirements if enabling
   branding verification. A shared hosting address cannot be assumed to satisfy
   all domain ownership verification requirements.
5. Verify on a real Google account: login, redirect to customer dashboard, phone
   capture, logout and inactivity expiry. Verify owner Google login is rejected.

The button is displayed only when both Google variables exist. Convex Auth's
verified-email linking rules are retained; unverified password accounts are not
silently merged with Google accounts by matching the typed email. Existing
customers should keep using their original login to retain their booking history
until a verified account-linking process is provided.

## Password reset email setup

The provider supports Gmail SMTP (preferred for the current Gmail sender), or Resend. Set `AUTH_RESEND_KEY` and `AUTH_EMAIL_FROM` in
the Convex dashboard. The sender must be authorized by the email provider. Do not
set a Gmail address as an unverified Resend sender. Without a verified sender,
the provider's testing sender is suitable only for its permitted test recipients,
not general customer recovery. An unrestricted sender setup remains outstanding.

The form sends an expiring 15-minute code, then accepts that code and a new
12–128-character password. Unknown account requests have the same response as
known accounts. Request and code-validation attempts are separately limited to
five before a 15-minute lock. Codes are managed and consumed by Convex Auth;
application logs do not record them. Successful resets invalidate older sessions
and create a fresh guarded session. Google-only users recover access via Google.

Live email delivery and complete Google OAuth round trips require configured
credentials and must be tested before calling these options production-ready.

## OAuth return origin

OAuth must return to the same frontend origin where sign-in started so that the
host-scoped verifier cookie is present. The customer button passes an absolute
return URL. The backend allowlist accepts the www and bare Movara origins and
`https://carrental-pi-ten.vercel.app`, only on known auth/dashboard routes.
For local development, set `MOVARA_AUTH_LOCAL_ORIGIN=http://localhost:3000` on
the development deployment; localhost is rejected unless explicitly configured.
Do not add arbitrary preview domains or weaken this to accept any redirect.
Deploy the frontend change to Vercel as well as syncing Convex. A full live Google
round trip requires a real browser and customer Google consent.

## Activate Gmail password-reset sending

1. Sign into `movaracarhire@gmail.com` and enable Google 2-Step Verification.
2. Open https://myaccount.google.com/apppasswords and create an App Password
   named `Movara password reset`. This is a separate credential, not the Gmail
   account password. Do not send it in chat, commit it, or put it in NEXT_PUBLIC
   variables.
3. In the Convex dashboard select the deployment used by the website. Under
   Settings → Environment Variables add `AUTH_GMAIL_APP_PASSWORD`, with the
   generated App Password as its value. Spaces are stripped by the sender.
   No Gmail password, extra OAuth scope or domain purchase is needed.
4. Gmail takes precedence when this variable exists. The sender is fixed to
   `movaracarhire@gmail.com`; email can be sent only by the internal reset action.
5. Test Forgot password with an existing email/password customer account. Confirm
   delivery (also check spam), complete reset and verify the new password works
   and old sessions are signed out. Test expired/incorrect/reused codes. Google-only
   customers recover access with Google.

Gmail sending is subject to Google's account sending limits and abuse controls.
An account-password change may revoke App Passwords. Replace/revoke the App
Password in Google and Convex if sending stops or the credential is exposed.
Configuration presence makes recovery available but does not prove delivery;
real receipt and reset need to be confirmed after adding the credential.

## Production deployment

Production Cloud URL: `https://flexible-mammoth-262.eu-west-1.convex.cloud`.
Production OAuth callback:
`https://flexible-mammoth-262.eu-west-1.convex.site/api/auth/callback/google`.
See VERCEL_PRODUCTION.md for frontend variables and cutover checks. The earlier
`gregarious-rooster-215` URL is the development deployment, not production.
