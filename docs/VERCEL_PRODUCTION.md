# Vercel production Convex connection

In Vercel, open the existing **carrental** project → Settings → Environment
Variables. Set these for **Production**:

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_CONVEX_URL` | `https://flexible-mammoth-262.eu-west-1.convex.cloud` |
| `NEXT_PUBLIC_CONVEX_SITE_URL` | `https://flexible-mammoth-262.eu-west-1.convex.site` |

If the project also has `CONVEX_URL` or `CONVEX_SITE_URL` overrides, update them to
the matching production URLs or remove the redundant overrides. Do not point
Production at the old development deployment. Preview/local environments can
keep development URLs.

Redeploy the Production deployment after saving. Next.js embeds NEXT_PUBLIC
values at build time, so changing a variable alone does not update a live build.
Confirm the frontend changes are on the production branch before redeploying.

## Convex and Google prerequisites

The production deployment is separate from development: functions, authentication
configuration and data must be checked there before switching live traffic.
`SITE_URL` on production Convex should be `https://www.movaracarhire.com`.
Signing keys (`JWT_PRIVATE_KEY` and `JWKS`) must form a matching pair.
Google credentials and the Gmail App Password must be configured in production
if those features are used. Keep credentials in deployment settings, never source.

In the existing Google OAuth Web client, add this exact authorized redirect URI:

```
https://flexible-mammoth-262.eu-west-1.convex.site/api/auth/callback/google
```

Retain the development callback while local development still uses it. Changing
Convex URLs does not copy cars, photos, bookings or the admin login to production.
Check those records explicitly before launch. Do not bulk-import or overwrite
existing production data without reviewing the migration scope.

After deployment, verify public cars/photos, customer Google and password login,
private admin login, password reset and a booking request. A fresh login is
expected when moving between independent Convex authentication deployments.

If Vercel runs Convex deploy as part of its Build Command, update its server-only
`CONVEX_DEPLOY_KEY` to the production deployment's key as well. Never use a
NEXT_PUBLIC prefix for a deploy key. For frontend-only builds using `npm run build`,
a deploy key is not needed; backend functions are deployed separately.

## Current setup result

The current backend was deployed successfully to flexible-mammoth-262. Production
signing keys, SITE_URL, Google credentials and Gmail sender credentials have been
configured without exposing their values. Anonymous account access returns null;
Google and reset-email configuration availability checks pass. The production
catalogue currently returns zero public vehicles. No vehicle, photo, booking,
customer or admin-account data migration was performed. Vercel variables and the
Google Console production callback still require account-owner changes because
no Vercel or Google Console connection is available in this workspace.
