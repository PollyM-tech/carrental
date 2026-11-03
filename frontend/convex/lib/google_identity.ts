import { normaliseEmail, OWNER_EMAIL } from "./identity.ts";

export const GOOGLE_CREDENTIAL = "oauth:google";
export function googleProfile(profile: { sub?: string; email?: string; email_verified?: boolean; name?: string }) {
  const email = normaliseEmail(profile.email);
  if (!profile.sub || profile.email_verified !== true) throw new Error("A verified Google email is required.");
  if (email === OWNER_EMAIL) throw new Error("Use the private admin email/password sign-in.");
  return { id: profile.sub, email, emailVerified: true, name: profile.name };
}
