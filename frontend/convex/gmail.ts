"use node";
import nodemailer from "nodemailer";
import { v } from "convex/values";
import { internalAction } from "./_generated/server";
import { GMAIL_SENDER, resetEmailText } from "./lib/reset_email";

// Internal only: customers cannot invoke this as a general-purpose mail sender.
export const sendPasswordReset = internalAction({
  args: { email: v.string(), code: v.string() },
  handler: async (_ctx, { email, code }) => {
    const password = process.env.AUTH_GMAIL_APP_PASSWORD?.replace(/\s/g, "");
    if (!password) throw new Error("Password reset email is not configured.");
    if (!/^[^\s@<>\r\n]+@[^\s@<>\r\n]+\.[^\s@<>\r\n]+$/.test(email) || !/^[a-f0-9]{32}$/.test(code)) throw new Error("Invalid password reset email.");
    const transport = nodemailer.createTransport({
      host: "smtp.gmail.com", port: 465, secure: true,
      auth: { user: GMAIL_SENDER, pass: password },
      connectionTimeout: 15000, greetingTimeout: 15000, socketTimeout: 20000,
      logger: false, debug: false,
    });
    try {
      const result = await transport.sendMail({
        from: `Movara Car Hire <${GMAIL_SENDER}>`, to: email,
        subject: "Reset your Movara password", text: resetEmailText(code),
        disableFileAccess: true, disableUrlAccess: true,
      });
      if (!result.accepted?.length || result.rejected?.length) throw new Error("Mail rejected");
    } catch { throw new Error("Password reset email could not be delivered."); }
    finally { transport.close(); }
  },
});
