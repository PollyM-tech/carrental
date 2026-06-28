import { v } from "convex/values";
import { mutation, query, type QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { requireAdminSession } from "./lib/adminAuth";

const carStatusValidator = v.union(
  v.literal("available"),
  v.literal("booked"),
  v.literal("maintenance"),
  v.literal("unavailable"),
);

async function withDisplayImageUrl(ctx: QueryCtx, car: Doc<"cars">) {
  const uploadedImageUrl = car.imageStorageId
    ? await ctx.storage.getUrl(car.imageStorageId)
    : null;

  return {
    ...car,
    displayImageUrl: uploadedImageUrl ?? car.imageUrl ?? null,
  };
}

/**
 * Admin generates upload URL for car images.
 */
export const generateUploadUrl = mutation({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);

    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Admin list.
 * Shows all non-deleted cars, including maintenance, booked, and unavailable.
 */
export const listCars = query({
  args: {
    adminToken: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);

    const cars = (await ctx.db.query("cars").order("desc").collect()).filter(
      (car) => !car.deletedAt,
    );

    return await Promise.all(cars.map((car) => withDisplayImageUrl(ctx, car)));
  },
});

/**
 * Public list.
 * Only available and non-deleted cars should appear on the website.
 */
export const listPublicCars = query({
  args: {},
  handler: async (ctx) => {
    const cars = (
      await ctx.db
        .query("cars")
        .withIndex("by_status", (q) => q.eq("status", "available"))
        .collect()
    ).filter((car) => !car.deletedAt);

    return await Promise.all(cars.map((car) => withDisplayImageUrl(ctx, car)));
  },
});

/**
 * Homepage featured cars.
 * A car must be featured, available, and not deleted.
 */
export const listFeaturedCars = query({
  args: {},
  handler: async (ctx) => {
    const cars = (
      await ctx.db
        .query("cars")
        .withIndex("by_status_and_featured", (q) =>
          q.eq("status", "available").eq("isFeatured", true),
        )
        .collect()
    ).filter((car) => !car.deletedAt);

    return await Promise.all(cars.map((car) => withDisplayImageUrl(ctx, car)));
  },
});

/**
 * Admin adds a new car.
 */
export const addCar = mutation({
  args: {
    adminToken: v.string(),

    name: v.string(),
    category: v.string(),
    pricePerDay: v.number(),

    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),

    seats: v.number(),
    transmission: v.string(),
    fuel: v.string(),

    status: carStatusValidator,

    description: v.string(),
    isFeatured: v.boolean(),

    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),

    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    plateNumber: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);

    const { adminToken, ...carData } = args;

    return await ctx.db.insert("cars", {
      ...carData,
      createdAt: Date.now(),
    });
  },
});

/**
 * Admin updates full car details.
 */
export const updateCar = mutation({
  args: {
    adminToken: v.string(),

    id: v.id("cars"),

    name: v.string(),
    category: v.string(),
    pricePerDay: v.number(),

    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),

    seats: v.number(),
    transmission: v.string(),
    fuel: v.string(),

    status: carStatusValidator,

    description: v.string(),
    isFeatured: v.boolean(),

    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),

    brand: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    plateNumber: v.optional(v.string()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);

    const { adminToken, id, ...updates } = args;

    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });

    return id;
  },
});

/**
 * Admin can quickly change car status.
 */
export const updateCarStatus = mutation({
  args: {
    adminToken: v.string(),
    id: v.id("cars"),
    status: carStatusValidator,
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);

    await ctx.db.patch(args.id, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Admin can feature or unfeature a car.
 * Only available cars should be shown publicly as featured.
 */
export const toggleFeatured = mutation({
  args: {
    adminToken: v.string(),
    id: v.id("cars"),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);

    await ctx.db.patch(args.id, {
      isFeatured: args.isFeatured,
      updatedAt: Date.now(),
    });

    return args.id;
  },
});

/**
 * Soft delete.
 * The car remains in database history but disappears from public/admin normal lists.
 */
export const deleteCar = mutation({
  args: {
    adminToken: v.string(),
    id: v.id("cars"),
  },
  handler: async (ctx, args) => {
    await requireAdminSession(ctx, args.adminToken);

    await ctx.db.patch(args.id, {
      status: "unavailable",
      isFeatured: false,
      deletedAt: Date.now(),
      updatedAt: Date.now(),
    });

    return args.id;
  },
});
