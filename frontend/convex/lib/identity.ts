export const OWNER_EMAIL = "movaracarhire@gmail.com";

export function normaliseEmail(value: unknown): string {
  if (typeof value !== "string") throw new Error("A valid email is required.");
  const email = value.trim().toLowerCase();
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("A valid email is required.");
  return email;
}

export function validateNewPassword(password: string) {
  if (typeof password !== "string" || password.length < 12 || password.length > 128) throw new Error("Use a password between 12 and 128 characters.");
}

export function passwordProfile(params: Record<string, unknown>, ownerSetupSecret: string | undefined) {
  const email = normaliseEmail(params.email);
  if (email === OWNER_EMAIL && params.flow === "signIn" && params.portal !== "admin") throw new Error("Use the private admin sign-in page.");
  if (params.flow === "signUp" && email === OWNER_EMAIL && (!ownerSetupSecret || typeof params.setupCode !== "string" || params.setupCode !== ownerSetupSecret)) {
    throw new Error("Owner registration requires the private setup code.");
  }
  if (params.flow === "signUp") {
    if (params.phone || email !== OWNER_EMAIL) return { email, phone: normalisePhone(params.phone) };
  }
  return { email };
}

/** Canonical international format. This validates formatting, not number ownership. */
export function normalisePhone(value: unknown): string {
  if (typeof value !== "string" || value.length > 80 || /[^\d+\s().-]/.test(value)) throw new Error("Enter a phone number with its country code, for example +44 7700 900123.");
  let phone = value.trim().replace(/[\s().-]/g, "");
  if (phone.startsWith("00")) phone = "+" + phone.slice(2);
  else if (/^0[17]\d{8}$/.test(phone)) phone = "+254" + phone.slice(1);
  else if (/^254[17]\d{8}$/.test(phone)) phone = "+" + phone;
  if (!/^\+[1-9]\d{6,14}$/.test(phone)) throw new Error("Use + followed by your country code and phone number (7–15 digits). Kenyan 07… and 01… numbers are also accepted.");
  return phone;
}
