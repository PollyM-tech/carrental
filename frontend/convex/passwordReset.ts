import { Email } from "@convex-dev/auth/providers/Email";

export function passwordResetConfigured() {
  return Boolean(process.env.AUTH_RESEND_KEY && process.env.AUTH_EMAIL_FROM);
}

// Convex Auth stores, expires and consumes this code. Never log codes or API keys.
export const passwordReset = Email({
  id: "password-reset",
  maxAge: 15 * 60,
  generateVerificationToken: async () => crypto.randomUUID().replaceAll("-", ""),
  async sendVerificationRequest({ identifier, token }) {
    if (!passwordResetConfigured()) throw new Error("Password reset email is not configured.");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.AUTH_EMAIL_FROM,
        to: identifier,
        subject: "Reset your Movara password",
        text: `Your Movara password reset code is:\n\n${token}\n\nIt expires in 15 minutes. Paste it into the password reset form. If you did not request this, ignore this email. Never share this code with anyone.`,
      }),
    });
    if (!response.ok) throw new Error("Password reset email could not be delivered.");
  },
});
