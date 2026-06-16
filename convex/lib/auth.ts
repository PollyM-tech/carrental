import { QueryCtx, MutationCtx } from "../_generated/server";
import { ConvexError } from "convex/values";

type Ctx = QueryCtx | MutationCtx;
export type Role = "platform_admin" | "staff" | "customer";

export async function requireAuth(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new ConvexError("Unauthenticated");

  const user = await ctx.db
    .query("users")
    .withIndex("by_workosUserId", (q) =>
      q.eq("workosUserId", identity.subject)
    )
    .first();

  if (!user || !user.isActive) throw new ConvexError("Unauthenticated");
  return user;
}

export async function requireRole(ctx: Ctx, roles: Role[]) {
  const user = await requireAuth(ctx);
  if (!roles.includes(user.role as Role)) {
    throw new ConvexError("Unauthorized");
  }
  return user;
}

export async function requireTenant(ctx: Ctx, workosOrganizationId: string) {
  const user = await requireAuth(ctx);
  if (user.workosOrganizationId !== workosOrganizationId) {
    throw new ConvexError("Unauthorized");
  }
  return user;
}

export async function getCurrentUser(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) return null;

  return ctx.db
    .query("users")
    .withIndex("by_workosUserId", (q) =>
      q.eq("workosUserId", identity.subject)
    )
    .first();
}
