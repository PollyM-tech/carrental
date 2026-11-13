import { signupReferral } from "./lib/referral";
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
    return { id: userId, name: user.name ?? "", email: user.email ?? "", phone: user.phone ?? "", roles: owner ? ["owner"] : [], staff: Boolean(owner), signupReferralRequired: user.signupReferralRequired === true, referralSource: user.referralSource, referralDetails: user.referralDetails };
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
      availablePaths: ["/dashboard", "/dashboard/bookings", "/dashboard/cars", "/dashboard/fleet", "/dashboard/data-requests"],
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

export const completeSignupReferral = mutation({
  args: { referralSource: v.string(), referralDetails: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx);
    if (!user.signupReferralRequired) return;
    const referral = signupReferral(args);
    await ctx.db.patch(user._id, { ...referral, signupReferralRequired: false });
  },
});

export const signupReferrals = query({
  args: {},
  handler: async ctx => {
    await requireRole(ctx);
    const users = await ctx.db.query("users").order("desc").take(100);
    return users.filter(user => user.referralSource).map(user => ({ id: user._id, email: user.email ?? "", name: user.name ?? "", referralSource: user.referralSource, referralDetails: user.referralDetails }));
  },
});
