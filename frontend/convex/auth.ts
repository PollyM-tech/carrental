import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";
import type { DataModel } from "./_generated/dataModel";
import type { MutationCtx } from "./_generated/server";
import { internal } from "./_generated/api";
import { prepareCredentialGuard } from "./lib/session_guard";
import { passwordProfile, OWNER_EMAIL, validateNewPassword } from "./lib/identity";

const password = Password<DataModel>({
    validatePasswordRequirements: validateNewPassword,
    profile(params) {
      return passwordProfile(params, process.env.MOVARA_OWNER_SETUP_SECRET);
    },
  });
const originalAuthorize = password.authorize!;
password.authorize = async (params, ctx) => {
  if (params.flow !== "signIn" && params.flow !== "signUp") return originalAuthorize(params, ctx);
  const email = typeof params.email === "string" ? params.email.trim().toLowerCase().slice(0, 254) : "";
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(email));
  const key = Array.from(new Uint8Array(digest), value => value.toString(16).padStart(2, "0")).join("");
  const attemptId = crypto.randomUUID();
  const attempt = await ctx.runMutation(internal.security.beginAttempt, { key, attemptId });
  if (!attempt.allowed) throw new Error(attempt.locked ? "LOGIN_LOCKED: Too many login attempts. Try again in 15 minutes." : "LOGIN_BUSY: A sign-in is being processed. Try again shortly.");
  let result;
  try { result = await originalAuthorize(params, ctx); }
  catch {
    const failure = await ctx.runMutation(internal.security.finishAttempt, { key, attemptId, success: false });
    if (failure.locked) throw new Error("LOGIN_LOCKED: Five failed login attempts. Try again in 15 minutes.");
    throw new Error("Sign-in failed. Check your email and password.");
  }
  await ctx.runMutation(internal.security.finishAttempt, { key, attemptId, success: result !== null });
  return result;
};
export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [password],
  signIn: { maxFailedAttempsPerHour: 60 },
  callbacks: {
    async beforeSessionCreation(ctx, { userId }) { await prepareCredentialGuard(ctx as MutationCtx, userId); },
    async afterUserCreatedOrUpdated(ctx, { userId, type, provider }) {
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
