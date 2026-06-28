import { ConvexError } from "convex/values";
import type { QueryCtx, MutationCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export async function requireAdminSession(ctx: Ctx, adminToken: string) {
  if (!adminToken) {
    throw new ConvexError("Unauthenticated");
  }

  const session = await ctx.db
    .query("adminSessions")
    .withIndex("by_token", (q) => q.eq("token", adminToken))
    .first();

  if (!session) {
    throw new ConvexError("Invalid admin session");
  }

  if (session.expiresAt < Date.now()) {
    throw new ConvexError("Admin session expired");
  }

  return session;
}
