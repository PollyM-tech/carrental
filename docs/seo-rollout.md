# SEO rollout

Deploy frontend and Convex changes together: registration now collects and saves required referral answers. Google registrations complete these once after returning from Google. Existing customer logins do not request them; booking requests reuse the saved account answers. Existing records remain compatible.

## Search Console

The canonical host is https://www.movaracarhire.com. Next.js redirects the apex host permanently to www, preserving paths and query strings. Ensure hosting settings do not redirect www back to the apex.

Keep `frontend/public/googlee68182d218969c59.html` permanently. After deployment, open https://www.movaracarhire.com/googlee68182d218969c59.html and confirm the verification text is visible, then click Verify in Search Console for https://www.movaracarhire.com/.

Submit https://www.movaracarhire.com/sitemap.xml and inspect the homepage, fleet, contact and service pages. Verification and sitemap submission do not guarantee ranking or immediate indexing.

Only one verification method is required. No HTML tag, Analytics or Tag Manager verification is needed for this URL-prefix property. Optionally create the Domain property `movaracarhire.com` and add the exact Google-supplied TXT value at the DNS provider without replacing existing records. That value has not been supplied yet.

## Confirmed business facts

Address: Jade Plaza, Lumumba Drive, Kasarani, Nairobi, Kenya. All vehicles are based in Nairobi. Coastal pages describe journeys from Nairobi rather than a Mombasa office.

The owner confirmed all four existing customer quotes are genuine and approved. Slavi Pattek's location is Germany. No review dates, ratings or Google attribution have been added. Add the Google Business Profile link when verification is complete.

Opening hours, an exact map pin, category deposit amounts, mileage allowances, insurance details and cancellation fees still need confirmation. Legal bases, detailed retention periods and cross-border privacy notices require an approved policy/legal review. A domain mailbox and password-reset email provider need account/DNS setup before switching delivery.

## Analytics activation

Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to the actual GA4 web stream ID (`G-...`) and rebuild. Without an ID analytics stays off. Google scripts load only after optional-cookie acceptance. Private account/admin pages are excluded from measurement.

Public call and WhatsApp clicks and saved public enquiries have explicit events. No form contents or booking references are sent. Disable automatic enhanced measurement in the GA4 web stream, especially form interactions, outbound clicks and automatic page changes, so only the explicit event setup collects data. Mark `enquiry_saved`, `call_click` and `whatsapp_click` as key events. WhatsApp clicks indicate intent, not a sent message or a completed rental. Signed-in requests remain available in Movara's admin dashboard; private pages are excluded from GA measurement.

After deployment, run mobile PageSpeed Insights and inspect Search Console indexing. No online payment integration was added.
