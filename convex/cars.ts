// import { v } from "convex/values";
// import { mutation, query } from "./_generated/server";
// import { requireAdmin } from "./auth";

// export const generateUploadUrl = mutation({
//   args: {},
//   handler: async (ctx) => {
//     await requireAdmin(ctx);
//     return await ctx.storage.generateUploadUrl();
//   },
// });

// export const listCars = query({
//   args: {},
//   handler: async (ctx) => {
//     await requireAdmin(ctx);

//     const cars = await ctx.db.query("cars").order("desc").collect();

//     return await Promise.all(
//       cars.map(async (car) => {
//         const uploadedImageUrl = car.imageStorageId
//           ? await ctx.storage.getUrl(car.imageStorageId)
//           : null;

//         return {
//           ...car,
//           displayImageUrl: uploadedImageUrl ?? car.imageUrl ?? "/hero.png",
//         };
//       }),
//     );
//   },
// });

// export const listPublicCars = query({
//   args: {},
//   handler: async (ctx) => {
//     const cars = await ctx.db.query("cars").order("desc").collect();

//     return await Promise.all(
//       cars.map(async (car) => {
//         const uploadedImageUrl = car.imageStorageId
//           ? await ctx.storage.getUrl(car.imageStorageId)
//           : null;

//         return {
//           ...car,
//           displayImageUrl: uploadedImageUrl ?? car.imageUrl ?? "/hero.png",
//         };
//       }),
//     );
//   },
// });

// export const listFeaturedCars = query({
//   args: {},
//   handler: async (ctx) => {
//     const cars = await ctx.db
//       .query("cars")
//       .withIndex("by_featured", (q) => q.eq("isFeatured", true))
//       .collect();

//     return await Promise.all(
//       cars.map(async (car) => {
//         const uploadedImageUrl = car.imageStorageId
//           ? await ctx.storage.getUrl(car.imageStorageId)
//           : null;

//         return {
//           ...car,
//           displayImageUrl: uploadedImageUrl ?? car.imageUrl ?? "/hero.png",
//         };
//       }),
//     );
//   },
// });

// export const addCar = mutation({
//   args: {
//     name: v.string(),
//     category: v.string(),
//     pricePerDay: v.number(),
//     imageStorageId: v.optional(v.id("_storage")),
//     imageUrl: v.optional(v.string()),
//     seats: v.number(),
//     transmission: v.string(),
//     fuel: v.string(),
//     status: v.union(
//       v.literal("Available"),
//       v.literal("Booked"),
//       v.literal("Maintenance"),
//     ),
//     description: v.string(),
//     isFeatured: v.boolean(),
//     rating: v.optional(v.number()),
//     reviewCount: v.optional(v.number()),
//   },
//   handler: async (ctx, args) => {
//     await requireAdmin(ctx);

//     return await ctx.db.insert("cars", {
//       ...args,
//       createdAt: Date.now(),
//     });
//   },
// });

// export const updateCar = mutation({
//   args: {
//     id: v.id("cars"),
//     name: v.string(),
//     category: v.string(),
//     pricePerDay: v.number(),
//     imageStorageId: v.optional(v.id("_storage")),
//     imageUrl: v.optional(v.string()),
//     seats: v.number(),
//     transmission: v.string(),
//     fuel: v.string(),
//     status: v.union(
//       v.literal("Available"),
//       v.literal("Booked"),
//       v.literal("Maintenance"),
//     ),
//     description: v.string(),
//     isFeatured: v.boolean(),
//     rating: v.optional(v.number()),
//     reviewCount: v.optional(v.number()),
//   },
//   handler: async (ctx, args) => {
//     await requireAdmin(ctx);

//     const { id, ...updates } = args;

//     await ctx.db.patch(id, {
//       ...updates,
//       updatedAt: Date.now(),
//     });

//     return id;
//   },
// });

// export const updateCarStatus = mutation({
//   args: {
//     id: v.id("cars"),
//     status: v.union(
//       v.literal("Available"),
//       v.literal("Booked"),
//       v.literal("Maintenance"),
//     ),
//   },
//   handler: async (ctx, args) => {
//     await requireAdmin(ctx);

//     await ctx.db.patch(args.id, {
//       status: args.status,
//       updatedAt: Date.now(),
//     });

//     return args.id;
//   },
// });

// export const toggleFeatured = mutation({
//   args: {
//     id: v.id("cars"),
//     isFeatured: v.boolean(),
//   },
//   handler: async (ctx, args) => {
//     await requireAdmin(ctx);

//     await ctx.db.patch(args.id, {
//       isFeatured: args.isFeatured,
//       updatedAt: Date.now(),
//     });

//     return args.id;
//   },
// });

// export const deleteCar = mutation({
//   args: {
//     id: v.id("cars"),
//   },
//   handler: async (ctx, args) => {
//     await requireAdmin(ctx);
//     await ctx.db.delete(args.id);
//     return args.id;
//   },
// });