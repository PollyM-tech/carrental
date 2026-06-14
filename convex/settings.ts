import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("settings").first();

    if (!settings) {
      return {
        businessName: "MoBri Car Hire",
        whatsappNumber: "254716741039",
        phoneNumber: "0716741039",
        email: "mobricarhire@gmail.com",
        location: "Nairobi, Kenya",
      };
    }

    return settings;
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
    await requireAdmin(ctx);

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