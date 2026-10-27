import { v } from "convex/values";
import { internalMutation, mutation, query } from "./_generated/server";
import { liveSession, prepareCredentialGuard } from "./lib/session_guard";
import { beginLogin, finishLogin } from "./lib/security_policy";
export const status = query({ args: {}, handler: async ctx => {
  const session = await liveSession(ctx);
  return session ? { warningAt: session.warningAt, expiresAt: session.expiresAt, serverNow: session.serverNow, sessionId: session.sessionId } : null;
}});
export const touch = mutation({ args: {}, handler: async ctx => {
  const session = await liveSession(ctx); if (!session) return null;
  const now = Date.now();
  if (session.activity) await ctx.db.patch(session.activity._id, { lastActiveAt: now });
  else await ctx.db.insert("movaraSessionActivity", { sessionId: session.sessionId, lastActiveAt: now });
  return { lastActiveAt: now };
}});
export const beginAttempt = internalMutation({ args: { key: v.string(), attemptId: v.string() }, handler: async (ctx, args) => {
  const current = await ctx.db.query("movaraLoginGuards").withIndex("by_key", q => q.eq("key", args.key)).unique();
  const result = beginLogin(current, args.attemptId, Date.now());
  if (!result.allowed) return { allowed: false, waitMs: result.waitMs, locked: !!current?.lockedUntil && current.lockedUntil > Date.now() };
  const data = { key: args.key, ...result.state, lockedUntil: undefined };
  if (current) await ctx.db.patch(current._id, data); else await ctx.db.insert("movaraLoginGuards", data);
  return { allowed: true, waitMs: 0, locked: false };
}});
export const finishAttempt = internalMutation({ args: { key: v.string(), attemptId: v.string(), success: v.boolean() }, handler: async (ctx, args) => {
  const current = await ctx.db.query("movaraLoginGuards").withIndex("by_key", q => q.eq("key", args.key)).unique();
  if (!current) return { locked: false };
  const data = finishLogin(current, args.attemptId, args.success, Date.now());
  await ctx.db.patch(current._id, { ...data, lockedUntil: data.lockedUntil });
  return { locked: !!data.lockedUntil && data.lockedUntil > Date.now() };
}});
// CLI-only maintenance: change the hash and revoke sessions in one transaction.
export const resetOwnerPassword = internalMutation({ args: { hashedSecret: v.string() }, handler: async (ctx, { hashedSecret }) => {
  if (hashedSecret.length < 32 || hashedSecret.length > 1000) throw new Error("Invalid password hash.");
  const account = await ctx.db.query("authAccounts").withIndex("providerAndAccountId", q => q.eq("provider", "password").eq("providerAccountId", "movaracarhire@gmail.com")).unique();
  if (!account) throw new Error("Admin account unavailable.");
  const user = await ctx.db.get(account.userId);
  const owner = await ctx.db.query("staffMemberships").withIndex("by_user", q => q.eq("userId", account.userId)).unique();
  if (user?.email !== "movaracarhire@gmail.com" || !owner?.active || !owner.roles.includes("owner")) throw new Error("Admin account unavailable.");
  await ctx.db.patch(account._id, { secret: hashedSecret });
  await prepareCredentialGuard(ctx, account.userId);
}});
