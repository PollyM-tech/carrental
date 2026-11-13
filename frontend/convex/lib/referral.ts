export const referralSources = ["Google / Search engine", "LinkedIn", "Facebook", "Instagram", "TikTok", "Reddit", "WhatsApp", "YouTube", "X / Twitter", "Friend", "Family", "Returning customer", "Other"] as const;
export function validateReferralSource(value?: string) {
  if (value === undefined || value === "") return undefined;
  if (!(referralSources as readonly string[]).includes(value) && value !== "Friend / Family referral") throw new Error("Choose a valid referral source.");
  return value;
}

export function validateReferralDetails(value?: string, source?: string) {
  const details = value?.trim();
  if (!details) return undefined;
  if (!source) throw new Error("Choose where you heard about us before adding details.");
  if (details.length > 300) throw new Error("Referral details must be at most 300 characters.");
  return details;
}

export function signupReferral(params: Record<string, unknown>) {
  const referralSource = validateReferralSource(typeof params.referralSource === "string" ? params.referralSource : undefined);
  const referralDetails = validateReferralDetails(typeof params.referralDetails === "string" ? params.referralDetails : undefined, referralSource);
  if (!referralSource || !referralDetails) throw new Error("Tell us where you heard about us and where exactly.");
  return { referralSource, referralDetails };
}
