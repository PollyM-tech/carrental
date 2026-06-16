import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireRole } from "./lib/auth";

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();
    return settings ?? null;
  },
});

export const updateSettings = mutation({
  args: {
    businessName: v.string(),
    whatsappNumber: v.string(),
    phoneNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireRole(ctx, ["platform_admin"]);

    const existing = await ctx.db.query("settings").first();

    if (!existing) {
      return await ctx.db.insert("settings", {
        ...args,
        createdAt: Date.now(),
      });
    }

    await ctx.db.patch(existing._id, {
      ...args,
      updatedAt: Date.now(),
    });

    return existing._id;
  },
});
