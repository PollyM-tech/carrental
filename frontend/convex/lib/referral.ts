export const referralSources = ["Google / Search engine", "Facebook", "Instagram", "TikTok", "WhatsApp", "Friend / Family referral", "Returning customer", "Other"] as const;
export function validateReferralSource(value?: string) {
  if (value === undefined || value === "") return undefined;
  if (!(referralSources as readonly string[]).includes(value)) throw new Error("Choose a valid referral source.");
  return value;
}
