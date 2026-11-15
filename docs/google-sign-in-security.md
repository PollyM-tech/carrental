# Google sign-in branding and security

## What the screenshot establishes

Google's consent screen currently identifies the app by its Convex HTTP hostname. That hostname is public infrastructure, not a password, API secret or evidence of unauthorized database access. A branded domain improves recognition; it does not replace authentication or authorization, and does not make the backend private.

The public production settings checked on 14 November 2026 are:

- Website: `https://www.movaracarhire.com`
- Convex HTTP/OAuth host: `https://flexible-mammoth-262.eu-west-1.convex.site`

The Google Cloud app name, published branding and verification status are not accessible from this checkout. The screenshot alone cannot distinguish missing branding from unpublished/unverified branding.

## Correct the Google consent screen

In the Google Cloud project that owns the existing OAuth client, open **Google Auth Platform → Branding** and set/check:

| Field | Value |
| --- | --- |
| App name | Movara Car Hire |
| User support email | movaracarhire@gmail.com |
| App homepage | https://www.movaracarhire.com/ |
| Privacy policy | https://www.movaracarhire.com/privacy |
| Terms | https://www.movaracarhire.com/rental-terms |
| Authorized domain | movaracarhire.com |
| Logo | The approved Movara logo |

Use a Google account that has the appropriate Search Console ownership and Google Cloud project permissions. Search Console verification alone does not publish Google OAuth branding. Complete Google's branding verification and **Publish branding** when available; saved draft edits do not necessarily appear on the public consent screen.

Keep Google data access restricted to `openid email profile`. Customer sign-in does not need Gmail inbox, Drive or Calendar access. The Google client secret stays in Convex environment settings, never in `NEXT_PUBLIC_*` variables, browser code or chat.

## Optional branded HTTP domain

Proposed hostname: `auth.movaracarhire.com`.

Convex's current documentation requires a **Pro plan** for custom domains. No upgrade, DNS record, OAuth client setting or production environment variable was changed during this work.

1. Add the hostname as an **HTTP actions** custom domain on the production Convex deployment. Copy the exact DNS records Convex supplies to the DNS provider. Do not guess CNAME targets or change website/mail records.
2. Wait for Convex to verify DNS and provision HTTPS. Confirm the custom host serves the existing HTTP auth routes.
3. In Google Auth Platform → Clients → the existing web OAuth client, add `https://auth.movaracarhire.com/api/auth/callback/google` to authorized redirect URIs. This exact path is confirmed from the installed `@convex-dev/auth` **0.0.96** package; newer Convex Auth documentation may show different routes.
4. Follow Convex's supported system-domain override procedure for `CONVEX_SITE_URL`. Review the complete frontend/backend rollout first: this setting is also the JWT issuer in `convex/auth.config.ts`, and changing it can require existing users to sign in again. Keep `SITE_URL` as `https://www.movaracarhire.com`.
5. Update any frontend HTTP-site configuration that uses the old site hostname, deploy compatible frontend/backend versions together, and test a new Google sign-in, an existing Google sign-in, password sign-in, sign-out, customer/admin separation, and expired sessions.
6. Retain the working old redirect URI during the verified rollout. Remove obsolete Google redirect entries only after migration and rollback checks.

An HTTP-action custom domain is different from a Convex API custom domain. Do not replace `NEXT_PUBLIC_CONVEX_URL` with an HTTP-action domain: queries/mutations and WebSockets use the API endpoint, and media URLs may also depend on that endpoint. Keep signing keys and client secrets unchanged unless there is separate evidence they were compromised.

## Local hardening implemented

- Removed the automatically trusted legacy Vercel preview host from OAuth return URLs. Production branding domains remain allowed; an intentionally configured `SITE_URL` can still be used by a separate preview deployment.
- Added a baseline Content Security Policy blocking plugin objects, framing, external base URLs and cross-origin HTML form submissions. This intentionally does **not** claim to be a full script-restricting/XSS-prevention CSP; that would need a nonce-compatible Next.js rollout and separate testing.
- Added `X-Permitted-Cross-Domain-Policies: none` alongside existing content-type, framing, referrer and permissions headers.
- Replaced raw customer-facing booking/registration mutation errors with safe business messages. Known booking validation errors are deliberately structured; unexpected errors use generic Movara wording. This improves error handling and does not attempt to conceal public network endpoints from browser developer tools.
- Retained server-side owner checks, customer ownership checks, idle-session expiry, credential-change revocation and failed-login throttling.

The production dependency audit returned zero known npm advisories at the time checked. This is a point-in-time result, not a guarantee against attacks. Relevant installed authentication-library files were compared with the published 0.0.96 package and matched. No environment or private-key files were found tracked; this was not a full historical secret scan or penetration test.

Google branding/domain setup is still an external account task. The local hardening changes require compatible frontend/backend deployment before they affect the live site. Production deployment approval from the earlier booking incident is still pending; it has not been inferred from this request.

## Sources

- https://developers.google.com/identity/verification/authentication-verification
- https://developers.google.com/identity/protocols/oauth2/production-readiness/overview
- https://docs.convex.dev/production/custom-domains
- Installed `@convex-dev/auth` 0.0.96: `server/oauth/convexAuth`, `server/implementation/signIn`, `server/implementation/tokens`
