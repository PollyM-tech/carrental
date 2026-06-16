import type { QueryCtx, MutationCtx } from "./_generated/server";
import { requireRole } from "./lib/auth";

type Ctx = QueryCtx | MutationCtx;

export async function requireAdmin(ctx: Ctx) {
  return await requireRole(ctx, ["platform_admin"]);
}

export async function getCurrentUser(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  return {
    subject: identity.subject,
    name: identity.name,
    email: identity.email,
  };
}
