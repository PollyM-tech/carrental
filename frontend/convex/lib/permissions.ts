import { liveSession } from "./session_guard.ts";
import type { QueryCtx, MutationCtx } from "../_generated/server";
export type StaffRole = "owner" | "admin" | "fleet_manager" | "kyc_reviewer" | "front_desk" | "finance";

export async function requireUser(ctx: QueryCtx | MutationCtx) {
  const session = await liveSession(ctx);
  if (!session) throw new Error("Sign in to continue.");
  const user = await ctx.db.get(session.userId);
  if (!user) throw new Error("Account unavailable.");
  return user;
}

export async function requireRole(ctx: QueryCtx | MutationCtx, ...roles: StaffRole[]) {
  const user = await requireUser(ctx);
  const membership = await ctx.db.query("staffMemberships").withIndex("by_user", q => q.eq("userId", user._id)).unique();
  // Only the client's existing owner account can operate this deployment.
  // Retain the argument shape for existing vehicle functions; no staff access is granted.
  void roles;
  if (user.email !== "movaracarhire@gmail.com" || !membership?.active || !membership.roles.includes("owner")) throw new Error("You do not have permission for this action.");
  return { user, membership };
}
