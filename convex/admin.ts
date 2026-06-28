import { ConvexError, v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAdminSession } from "./lib/adminAuth";

function createToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export const login = mutation({
  args: {
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      throw new ConvexError("ADMIN_PASSWORD is not set in Convex env");
    }

    if (args.password !== adminPassword) {
      throw new ConvexError("Invalid password");
    }

    const token = createToken();
    const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 7;

    await ctx.db.insert("adminSessions", {
      token,
      expiresAt,
      createdAt: Date.now(),
    });

    return {
      token,
      expiresAt,
    };
  },
});

export const verify = query({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);

    return {
      ok: true,
    };
  },
});

export const logout = mutation({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("adminSessions")
      .withIndex("by_token", (q) => q.eq("token", args.adminToken))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return {
      ok: true,
    };
  },
});
