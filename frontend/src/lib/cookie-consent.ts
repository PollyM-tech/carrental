export const CONSENT_COOKIE = "movara_cookie_choice";
export type CookieChoice = "accepted" | "declined" | "unknown";
export function readCookieChoice(cookies: string): CookieChoice {
  const value = cookies.split(";").map(part => part.trim()).find(part => part.startsWith(`${CONSENT_COOKIE}=`))?.slice(CONSENT_COOKIE.length + 1);
  return value === "v1.accepted" ? "accepted" : value === "v1.declined" ? "declined" : "unknown";
}
export function consentCookie(choice: Exclude<CookieChoice, "unknown">, secure: boolean) {
  return `${CONSENT_COOKIE}=v1.${choice}; Path=/; Max-Age=15552000; SameSite=Lax${secure ? "; Secure" : ""}`;
}
export function optionalCookiesAllowed(cookies: string) { return readCookieChoice(cookies) === "accepted"; }
