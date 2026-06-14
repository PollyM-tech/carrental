import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  cars: defineTable({
    name: v.string(),
    category: v.string(),
    pricePerDay: v.number(),

    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),

    seats: v.number(),
    transmission: v.string(),
    fuel: v.string(),

    status: v.union(
      v.literal("Available"),
      v.literal("Booked"),
      v.literal("Maintenance"),
    ),

    description: v.string(),
    isFeatured: v.boolean(),

    rating: v.optional(v.number()),
    reviewCount: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  })
    .index("by_featured", ["isFeatured"])
    .index("by_status", ["status"])
    .index("by_category", ["category"]),

  settings: defineTable({
    businessName: v.string(),
    whatsappNumber: v.string(),
    phoneNumber: v.optional(v.string()),
    email: v.optional(v.string()),
    location: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }),
});