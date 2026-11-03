import type { GenericActionCtx } from "convex/server";
import type { DataModel } from "./_generated/dataModel";
import { internal } from "./_generated/api.js";
import { resetEmailProvider, resetEmailText } from "./lib/reset_email.ts";
import { Email } from "@convex-dev/auth/providers/Email";

export function passwordResetConfigured() {
  return resetEmailProvider() !== null;
}

// Convex Auth stores, expires and consumes this code. Never log codes or API keys.
export const passwordReset = Email({
  id: "password-reset",
  maxAge: 15 * 60,
  generateVerificationToken: async () => crypto.randomUUID().replaceAll("-", ""),
  async sendVerificationRequest({ identifier, token }, ctx?: GenericActionCtx<DataModel>) {
    if (!passwordResetConfigured()) throw new Error("Password reset email is not configured.");
    if (resetEmailProvider() === "gmail") {
      if (!ctx) throw new Error("Password reset context unavailable.");
      await ctx.runAction(internal.gmail.sendPasswordReset, { email: identifier, code: token });
      return;
    }
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: process.env.AUTH_EMAIL_FROM,
        to: identifier,
        subject: "Reset your Movara password",
        text: resetEmailText(token),
      }),
    });
    if (!response.ok) throw new Error("Password reset email could not be delivered.");
  },
});
