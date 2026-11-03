/** Keep the OAuth verifier cookie on the host where sign-in began. */
export function authRedirect(redirectTo: string, siteUrl: string, localOrigin?: string) {
  const primary = new URL(siteUrl).origin;
  const allowed = new Set([primary, "https://www.movaracarhire.com", "https://movaracarhire.com", "https://carrental-pi-ten.vercel.app"]);
  if (localOrigin) {
    const local = new URL(localOrigin);
    if (["localhost", "127.0.0.1"].includes(local.hostname) && ["http:", "https:"].includes(local.protocol)) allowed.add(local.origin);
  }
  const target = new URL(redirectTo, primary);
  if (target.username || target.password || !allowed.has(target.origin) || !["/sign-in", "/workspace", "/movara-access", "/dashboard"].includes(target.pathname)) throw new Error("Invalid authentication return address.");
  return target.toString();
}
