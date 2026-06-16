import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { requireAuth, requireRole } from "./lib/auth";

export const getMe = query({
  args: {},
  handler: async (ctx) => {
    const user = await requireAuth(ctx);
    return user;
  },
});

export const updateProfile = mutation({
  args: {
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await requireAuth(ctx);
    await ctx.db.patch(user._id, {
      ...args,
      updatedAt: Date.now(),
    });
  },
});

export const listUsers = query({
  args: {
    role: v.optional(v.union(
      v.literal("platform_admin"),
      v.literal("staff"),
      v.literal("customer")
    )),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["platform_admin"]);

    if (args.role) {
      return await ctx.db
        .query("users")
        .withIndex("by_role", (q) => q.eq("role", args.role as "platform_admin" | "staff" | "customer"))
        .order("desc")
        .collect();
    }

    return await ctx.db.query("users").order("desc").collect();
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(
      v.literal("platform_admin"),
      v.literal("staff"),
      v.literal("customer")
    ),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["platform_admin"]);

    if (currentUser._id === args.userId) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });
  },
});

export const deactivateUser = mutation({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await requireRole(ctx, ["platform_admin"]);

    if (currentUser._id === args.userId) {
      throw new ConvexError("Unauthorized");
    }

    await ctx.db.patch(args.userId, {
      isActive: false,
      updatedAt: Date.now(),
    });
  },
});
