import { liveSession } from "./lib/session_guard";
import { requireRole } from "./lib/permissions";
import { normalisePhone } from "./lib/identity";
import { requireUser } from "./lib/permissions";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const current = query({
  args: {},
  handler: async ctx => {
    const session = await liveSession(ctx);
    if (!session) return null;
    const userId = session.userId;
    const user = await ctx.db.get(userId);
    if (!user) return null;
    const membership = await ctx.db.query("staffMemberships").withIndex("by_user", q => q.eq("userId", userId)).unique();
    const owner = user.email === "movaracarhire@gmail.com" && membership?.active && membership.roles.includes("owner");
    return { id: userId, email: user.email ?? "", phone: user.phone ?? "", roles: owner ? ["owner"] : [], staff: Boolean(owner) };
  },
});

export const adminOverview = query({
  args: {},
  handler: async ctx => {
    const { user, membership } = await requireRole(ctx);
    return {
      email: user.email ?? "",
      owner: membership.roles.includes("owner"),
      roles: membership.roles,
      availablePaths: ["/dashboard", "/dashboard/bookings", "/dashboard/cars", "/dashboard/fleet"],
    };
  },
});

export const savePhone = mutation({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    const phone = normalisePhone(args.phone);
    if (phone !== user.phone) await ctx.db.patch(user._id, { phone, phoneVerificationTime: undefined });
    return { phone };
  },
});
