// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  // ─── USERS ────────────────────────────────────────────────────────────────
  // Synced from WorkOS via webhook. Never created directly by the client.
  users: defineTable({
    workosUserId:   v.string(),
    email:          v.string(),
    role:           v.union(
                      v.literal("platform_admin"),
                      v.literal("staff"),
                      v.literal("customer"),
                    ),
    firstName:      v.optional(v.string()),
    lastName:       v.optional(v.string()),
    phone:          v.optional(v.string()),
    avatarUrl:      v.optional(v.string()),
    isActive:       v.boolean(),
    createdAt:      v.number(),
    updatedAt:      v.optional(v.number()),
  })
    .index("by_workosUserId", ["workosUserId"])
    .index("by_email",        ["email"])
    .index("by_role",         ["role"]),

  // // ─── CARS ─────────────────────────────────────────────────────────────────
  // // Unchanged from existing schema — preserved exactly.
  // cars: defineTable({
  //   name:           v.string(),
  //   category:       v.string(),
  //   pricePerDay:    v.number(),

  //   imageStorageId: v.optional(v.id("_storage")),
  //   imageUrl:       v.optional(v.string()),

  //   seats:          v.number(),
  //   transmission:   v.string(),
  //   fuel:           v.string(),

  //   status:         v.union(
  //                     v.literal("Available"),
  //                     v.literal("Booked"),
  //                     v.literal("Maintenance"),
  //                   ),

  //   description:    v.string(),
  //   isFeatured:     v.boolean(),

  //   rating:         v.optional(v.number()),
  //   reviewCount:    v.optional(v.number()),

  //   createdAt:      v.number(),
  //   updatedAt:      v.optional(v.number()),
  // })
  //   .index("by_featured",  ["isFeatured"])
  //   .index("by_status",    ["status"])
  //   .index("by_category",  ["category"]),

  // // ─── BOOKINGS ─────────────────────────────────────────────────────────────
  // bookings: defineTable({
  //   // Relations
  //   userId:         v.id("users"),
  //   carId:          v.id("cars"),

  //   // Status lifecycle: pending → confirmed → active → completed | cancelled
  //   status:         v.union(
  //                     v.literal("pending"),
  //                     v.literal("confirmed"),
  //                     v.literal("active"),
  //                     v.literal("completed"),
  //                     v.literal("cancelled"),
  //                   ),

  //   // Dates stored as ISO strings (YYYY-MM-DD) for display safety
  //   startDate:      v.string(),
  //   endDate:        v.string(),
  //   totalDays:      v.number(),
  //   totalAmount:    v.number(),   // pricePerDay * totalDays, computed on create

  //   // Customer snapshot — stored so booking record is self-contained
  //   // even if user updates their profile later
  //   customerName:   v.string(),
  //   customerEmail:  v.string(),
  //   customerPhone:  v.string(),

  //   // Optional
  //   notes:          v.optional(v.string()),
  //   cancelReason:   v.optional(v.string()),

  //   // Audit
  //   confirmedBy:    v.optional(v.id("users")),  // staff/admin who confirmed
  //   cancelledBy:    v.optional(v.id("users")),  // staff/admin who cancelled
  //   confirmedAt:    v.optional(v.number()),
  //   cancelledAt:    v.optional(v.number()),
  //   completedAt:    v.optional(v.number()),

  //   createdAt:      v.number(),
  //   updatedAt:      v.optional(v.number()),
  // })
  //   .index("by_userId",    ["userId"])
  //   .index("by_carId",     ["carId"])
  //   .index("by_status",    ["status"])
  //   .index("by_createdAt", ["createdAt"])
  //   .index("by_car_and_status", ["carId", "status"]),

  // // ─── SETTINGS ─────────────────────────────────────────────────────────────
  // // Single-row table. Always upsert, never insert a second row.
  // // Unchanged from existing schema — preserved exactly.
  // settings: defineTable({
  //   businessName:     v.string(),
  //   whatsappNumber:   v.string(),
  //   phoneNumber:      v.optional(v.string()),
  //   email:            v.optional(v.string()),
  //   location:         v.optional(v.string()),
  //   createdAt:        v.number(),
  //   updatedAt:        v.optional(v.number()),
  // }),

});