import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdminSession } from "./lib/adminAuth";

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return settings ?? null;
  },
});

export const updateSettings = mutation({
  args: {
    adminToken: v.string(),

    businessName: v.string(),
    whatsappNumber: v.string(),
    phoneNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);

    const { adminToken, ...settingsData } = args;

    const existing = await ctx.db.query("settings").first();

    if (!existing) {
      return await ctx.db.insert("settings", {
        ...settingsData,
        createdAt: Date.now(),
      });
    }

    await ctx.db.patch(existing._id, {
      ...settingsData,
      updatedAt: Date.now(),
    });

    return existing._id;
  },
});
