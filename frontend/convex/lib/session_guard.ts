import { getAuthSessionId, getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { idleDeadline, sessionStillValid, WARNING_AFTER_MS } from "./security_policy.ts";
export async function liveSession(ctx: QueryCtx | MutationCtx) {
  const userId = await getAuthUserId(ctx); const sessionId = await getAuthSessionId(ctx);
  if (!userId || !sessionId) return null;
  const [session, guard, account, activity] = await Promise.all([
    ctx.db.get(sessionId),
    ctx.db.query("movaraCredentialGuards").withIndex("by_user", q => q.eq("userId", userId)).unique(),
    ctx.db.query("authAccounts").withIndex("userIdAndProvider", q => q.eq("userId", userId).eq("provider", "password")).unique(),
    ctx.db.query("movaraSessionActivity").withIndex("by_session", q => q.eq("sessionId", sessionId)).unique(),
  ]);
  const now = Date.now();
  if (!sessionStillValid(session, userId, guard, account?.secret, activity?.lastActiveAt, now)) return null;
  const lastActiveAt = activity?.lastActiveAt ?? session!._creationTime;
  return { userId, sessionId, activity, lastActiveAt, warningAt: lastActiveAt + WARNING_AFTER_MS, expiresAt: idleDeadline(lastActiveAt), serverNow: now };
}
export async function deleteUserSessions(ctx: MutationCtx, userId: Id<"users">) {
  const sessions = await ctx.db.query("authSessions").withIndex("userId", q => q.eq("userId", userId)).collect();
  for (const session of sessions) {
    const tokens = await ctx.db.query("authRefreshTokens").withIndex("sessionId", q => q.eq("sessionId", session._id)).collect();
    for (const token of tokens) await ctx.db.delete(token._id);
    const activity = await ctx.db.query("movaraSessionActivity").withIndex("by_session", q => q.eq("sessionId", session._id)).unique();
    if (activity) await ctx.db.delete(activity._id);
    await ctx.db.delete(session._id);
  }
}
// Called before Convex Auth creates a session. A changed password revokes all older sessions.
export async function prepareCredentialGuard(ctx: MutationCtx, userId: Id<"users">) {
  const account = await ctx.db.query("authAccounts").withIndex("userIdAndProvider", q => q.eq("userId", userId).eq("provider", "password")).unique();
  if (!account?.secret) throw new Error("Password account unavailable.");
  const guard = await ctx.db.query("movaraCredentialGuards").withIndex("by_user", q => q.eq("userId", userId)).unique();
  if (guard?.secretHash === account.secret) return;
  await deleteUserSessions(ctx, userId);
  const data = { userId, secretHash: account.secret, changedAt: Date.now() };
  if (guard) await ctx.db.patch(guard._id, data); else await ctx.db.insert("movaraCredentialGuards", data);
}
