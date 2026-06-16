import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const roleValidator = v.union(
  v.literal("platform_admin"),
  v.literal("staff"),
  v.literal("customer"),
);

export const upsertUser = mutation({
  args: {
    workosUserId: v.string(),
    email: v.string(),
    workosOrganizationId: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: roleValidator,
    isActive: v.boolean(),
    syncedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_workosUserId", (q) => q.eq("workosUserId", args.workosUserId))
      .first();

    if (!existing) {
      return await ctx.db.insert("users", {
        workosUserId: args.workosUserId,
        email: args.email,
        workosOrganizationId: args.workosOrganizationId,
        firstName: args.firstName,
        lastName: args.lastName,
        avatarUrl: args.avatarUrl,
        role: args.role,
        isActive: args.isActive,
        createdAt: args.syncedAt,
        lastSyncedAt: args.syncedAt,
      });
    }

    await ctx.db.patch(existing._id, {
      email: args.email,
      workosOrganizationId: args.workosOrganizationId ?? existing.workosOrganizationId,
      firstName: args.firstName,
      lastName: args.lastName,
      avatarUrl: args.avatarUrl,
      isActive: args.isActive,
      updatedAt: args.syncedAt,
      lastSyncedAt: args.syncedAt,
      deletedAt: undefined,
    });

    return existing._id;
  },
});

export const getUserByWorkosId = query({
  args: {
    workosUserId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_workosUserId", (q) => q.eq("workosUserId", args.workosUserId))
      .first();
  },
});

export const updateUser = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
    workosOrganizationId: v.optional(v.string()),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    await ctx.db.patch(userId, {
      ...updates,
      lastSyncedAt: args.updatedAt,
    });
  },
});

export const deactivateUser = mutation({
  args: {
    userId: v.id("users"),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      isActive: false,
      updatedAt: args.updatedAt,
      lastSyncedAt: args.updatedAt,
      deletedAt: args.updatedAt,
    });
  },
});

export const updateUserRole = mutation({
  args: {
    userId: v.id("users"),
    role: roleValidator,
    workosOrganizationId: v.optional(v.string()),
    updatedAt: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: args.role,
      workosOrganizationId: args.workosOrganizationId,
      updatedAt: args.updatedAt,
      lastSyncedAt: args.updatedAt,
    });
  },
});
