import { authRedirect } from "./lib/auth_redirect";
import Google from "@auth/core/providers/google";
import { googleProfile } from "./lib/google_identity";
import { passwordReset, passwordResetConfigured } from "./passwordReset";
import { materializeCredentials } from "./lib/credentials";
import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import type { DataModel } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { prepareCredentialGuard } from "./lib/session_guard";
import { passwordProfile, OWNER_EMAIL, validateNewPassword } from "./lib/identity";

const password = materializeCredentials(Password<DataModel>({
    reset: passwordReset,
    validatePasswordRequirements: validateNewPassword,
    profile(params) {
      return passwordProfile(params, process.env.MOVARA_OWNER_SETUP_SECRET);
    },
  }));
const originalAuthorize = password.authorize!;
password.authorize = async (params, ctx) => {
  const resetting = params.flow === "reset" || params.flow === "reset-verification";
  if (resetting && !passwordResetConfigured()) throw new Error("Password reset is currently unavailable. Contact Movara.");
  if (params.flow !== "signIn" && params.flow !== "signUp" && !resetting) return originalAuthorize(params, ctx);
  const email = typeof params.email === "string" ? params.email.trim().toLowerCase().slice(0, 254) : "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(resetting ? `${params.flow}:${email}` : email));
  const key = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, "0")).join("");
  const attemptId = crypto.randomUUID();
  const attempt = await ctx.runMutation(internal.security.beginAttempt, { key, attemptId });
  if (!attempt.allowed) throw new Error(attempt.locked ? "LOGIN_LOCKED: Too many login attempts. Try again in 15 minutes." : "LOGIN_BUSY: A sign-in is being processed. Try again shortly.");
  let result;
  try { result = await originalAuthorize(params, ctx); }
  catch {
    const failure = await ctx.runMutation(internal.security.finishAttempt, { key, attemptId, success: false });
    if (params.flow === "reset") return null; // Do not reveal whether an email has an account.
    if (failure.locked) throw new Error("LOGIN_LOCKED: Five failed login attempts. Try again in 15 minutes.");
    throw new Error("Sign-in failed. Check your email and password.");
  }
  await ctx.runMutation(internal.security.finishAttempt, { key, attemptId, success: params.flow === "reset" ? false : result !== null });
  if (params.flow === "reset-verification" && result) {
    await ctx.runMutation(internal.security.completePasswordReset, { userId: result.userId });
    return { userId: result.userId };
  }
  return result;
};
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [password, Google({ profile: googleProfile })],
  signIn: { maxFailedAttempsPerHour: 60 },
  callbacks: {
    async redirect({ redirectTo }) { return authRedirect(redirectTo, process.env.SITE_URL!, process.env.MOVARA_AUTH_LOCAL_ORIGIN); },
    async beforeSessionCreation(ctx, { userId }) { await prepareCredentialGuard(ctx as MutationCtx, userId); },
    async afterUserCreatedOrUpdated(ctx, { userId, type, provider, existingUserId }) {
      if (type === "oauth" && provider.id === "google" && existingUserId === null) {
        await (ctx as MutationCtx).db.patch(userId, { signupReferralRequired: true });
      }
      if (type !== "credentials" || provider.id !== "password") return;
      const db = (ctx as MutationCtx).db;
      const user = await db.get(userId);
      if (user?.email !== OWNER_EMAIL) return;
      const existing = await db.query("staffMemberships").withIndex("by_user", q => q.eq("userId", userId)).unique();
      if (!existing) {
        await db.insert("staffMemberships", { userId, roles: ["owner"], active: true });
        await db.insert("accessEvents", { subjectId: userId, action: "owner.provisioned", occurredAt: Date.now() });
      }
    },
  },
});
