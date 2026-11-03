export const GMAIL_SENDER = "movaracarhire@gmail.com";
export function resetEmailProvider() {
  if (process.env.AUTH_GMAIL_APP_PASSWORD?.replace(/\s/g, "")) return "gmail";
  if (process.env.AUTH_RESEND_KEY && process.env.AUTH_EMAIL_FROM) return "resend";
  return null;
}
export function resetEmailText(token: string) {
  return `Your Movara password reset code is:\n\n${token}\n\nIt expires in 15 minutes. Paste it into the password reset form. If you did not request this, ignore this email. Never share this code with anyone.`;
}
