import type { QueryCtx, MutationCtx } from "./_generated/server";

type Ctx = QueryCtx | MutationCtx;

export async function requireAdmin(ctx: Ctx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    throw new Error("You must be signed in.");
  }

  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) {
    throw new Error("ADMIN_EMAIL is not configured in Convex.");
  }

  const userEmail = identity.email?.toLowerCase();
  const allowedEmail = adminEmail.toLowerCase();

  if (userEmail !== allowedEmail) {
    throw new Error("You are not authorized as an admin.");
  }

  return identity;
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